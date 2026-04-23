package com.tradearena.productservice.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tradearena.productservice.dto.CreateProductRequest;
import com.tradearena.productservice.dto.PagedResponse;
import com.tradearena.productservice.dto.ProductDetailResponse;
import com.tradearena.productservice.dto.ProductListingSummary;
import com.tradearena.productservice.dto.RemoveProductResponse;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;
    private final ObjectMapper objectMapper;

    public ProductController(ProductService service, ObjectMapper objectMapper) {
        this.service = service;
        this.objectMapper = objectMapper;
    }

    // ── Sell page APIs ──────────────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(service.getCategoriesFromAdmin());
    }

    @GetMapping("/categories/{categoryId}/subcategories")
    public ResponseEntity<Map<String, Object>> getSubCategories(
            @PathVariable Integer categoryId) {
        return ResponseEntity.ok(service.getSubCategories(categoryId));
    }

    @GetMapping("/subcategories/{subCategoryId}/questions")
    public ResponseEntity<Map<String, Object>> getQuestions(
            @PathVariable Integer subCategoryId) {
        return ResponseEntity.ok(service.getQuestions(subCategoryId));
    }

    // ── Product listing APIs ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<PagedResponse<ProductListingSummary>> getProducts(
    		@RequestHeader("X-User-Id") Long currentUserId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subCategoryId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                service.getProducts(categoryId, subCategoryId, sellerId, status,currentUserId, page, size));
    }
    
    
    @GetMapping("/my")
    public ResponseEntity<PagedResponse<ProductListingSummary>> getMyProducts(
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subCategoryId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                service.getMyProducts(
                        categoryId,
                        subCategoryId,
                        currentUserId,   // 👈 sellerId = current user
                        status,
                        page,
                        size
                )
        );
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    /**
     * Create product — accepts multipart/form-data.
     *
     * Parts:
     *   - "data"   (required) : JSON string of CreateProductRequest
     *   - "images" (optional) : one or more image files
     *
     * Example curl:
     *   curl -X POST http://localhost:8083/api/products \
     *     -H "X-User-Id: 1" \
     *     -F 'data={"title":"iPhone","price":50000,...}' \
     *     -F 'images=@/path/to/photo.jpg'
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDetailResponse> createProduct(
            @RequestPart("data") String requestJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("X-User-Id") Long sellerId) throws Exception {

        CreateProductRequest request = objectMapper.readValue(requestJson, CreateProductRequest.class);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createProduct(request, sellerId, images));
    }

    /**
     * Fallback: plain JSON without images (backward compat / Postman testing)
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductDetailResponse> createProductJson(
            @Valid @RequestBody CreateProductRequest request,
            @RequestHeader("X-User-Id") Long sellerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createProduct(request, sellerId, null));
    }

    @PatchMapping("/id/{id}/remove")
    public ResponseEntity<RemoveProductResponse> removeProduct(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") Long sellerId) {
        return ResponseEntity.ok(service.removeProduct(id, sellerId));
    }

    @PutMapping("/id/{id}/mark-sold")
    public ResponseEntity<Void> markAsSold(@PathVariable UUID id) {
        service.markAsSold(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/id/{id}/mark-auction-sold")
    public ResponseEntity<Void> markAsAuctionSold(@PathVariable UUID id) {
        service.markAsAuctionSold(id);
        return ResponseEntity.noContent().build();
    }
}