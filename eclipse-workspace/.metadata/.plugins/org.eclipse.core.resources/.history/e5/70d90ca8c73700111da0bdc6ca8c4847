package com.tradearena.productservice.controller;

import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ProductListingSummary>> getProducts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID subCategoryId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                service.getProducts(categoryId, subCategoryId, sellerId, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDetailResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @RequestHeader("X-User-Id") Long sellerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createProduct(request, sellerId));
    }

    @PatchMapping("/{id}/remove")
    public ResponseEntity<RemoveProductResponse> removeProduct(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") Long sellerId) {
        return ResponseEntity.ok(service.removeProduct(id, sellerId));
    }

    @PutMapping("/{id}/mark-sold")
    public ResponseEntity<Void> markAsSold(@PathVariable UUID id) {
        service.markAsSold(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/mark-auction-sold")
    public ResponseEntity<Void> markAsAuctionSold(@PathVariable UUID id) {
        service.markAsAuctionSold(id);
        return ResponseEntity.noContent().build();
    }
}