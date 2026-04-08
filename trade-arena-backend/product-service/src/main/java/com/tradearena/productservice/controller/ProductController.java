package com.tradearena.productservice.controller;

import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Product Service.
 *
 * Security note:
 * All requests arrive via the API Gateway which validates the JWT and
 * forwards X-User-Id, X-User-Email, X-User-Role as headers.
 * This service reads sellerId from X-User-Id — no local JWT validation needed.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // -----------------------------------------------------------------------
    // Seller endpoints
    // -----------------------------------------------------------------------

    /**
     * Create a new product listing.
     * Requires X-User-Id header (set by API Gateway from JWT).
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @RequestHeader("X-User-Id") Integer sellerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createProduct(request, sellerId));
    }

    /**
     * Update an existing listing.
     * Only the seller who created it can update it.
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateProductRequest request,
            @RequestHeader("X-User-Id") Integer sellerId) {
        return ResponseEntity.ok(service.updateProduct(productId, request, sellerId));
    }

    /**
     * Enable Quick Bid (auction) mode on an existing listing.
     */
    @PutMapping("/{productId}/auction")
    public ResponseEntity<ProductResponse> enableAuction(
            @PathVariable Long productId,
            @Valid @RequestBody EnableAuctionRequest request,
            @RequestHeader("X-User-Id") Integer sellerId) {
        return ResponseEntity.ok(service.enableAuction(productId, request, sellerId));
    }

    /**
     * Deactivate (soft-delete) a listing.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deactivateProduct(
            @PathVariable Long productId,
            @RequestHeader("X-User-Id") Integer sellerId) {
        service.deactivateProduct(productId, sellerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all listings created by the authenticated seller.
     */
    @GetMapping("/my-listings")
    public ResponseEntity<List<ProductResponse>> getMyListings(
            @RequestHeader("X-User-Id") Integer sellerId) {
        return ResponseEntity.ok(service.getProductsBySeller(sellerId));
    }

    // -----------------------------------------------------------------------
    // Buyer / public browsing endpoints
    // -----------------------------------------------------------------------

    /**
     * Get a single product by ID.
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(service.getProductById(productId));
    }

    /**
     * Browse all active listings — paginated.
     */
    @GetMapping
    public ResponseEntity<PagedResponse<ProductResponse>> getActiveListings(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getActiveListings(page, size));
    }

    /**
     * Browse listings by category — paginated.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<PagedResponse<ProductResponse>> getByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getListingsByCategory(categoryId, page, size));
    }

    /**
     * Search listings by keyword, optionally filtered by category.
     * GET /api/products/search?keyword=iphone
     * GET /api/products/search?keyword=iphone&categoryId=3
     */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<ProductResponse>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.searchProducts(keyword, categoryId, page, size));
    }

    /**
     * Browse all active auction listings — paginated.
     */
    @GetMapping("/auctions")
    public ResponseEntity<PagedResponse<ProductResponse>> getAuctionListings(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAuctionListings(page, size));
    }

    /**
     * Get dynamic form fields for a category from Admin Service.
     * Frontend calls this when a seller selects a category to get
     * the list of required specification fields to display.
     */
    @GetMapping("/category/{categoryId}/form")
    public ResponseEntity<Object> getCategoryForm(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(service.getCategoryForm(categoryId));
    }

    // -----------------------------------------------------------------------
    // Internal endpoints — called by other microservices
    // -----------------------------------------------------------------------

    /**
     * Mark a product as SOLD — called by Order/Bidding service after payment.
     */
    @PutMapping("/{productId}/mark-sold")
    public ResponseEntity<ProductResponse> markAsSold(@PathVariable Long productId) {
        return ResponseEntity.ok(service.markAsSold(productId));
    }

    /**
     * Mark a product as AUCTION_SOLD — called by Camunda after auction payment confirmed.
     */
    @PutMapping("/{productId}/mark-auction-sold")
    public ResponseEntity<ProductResponse> markAsAuctionSold(@PathVariable Long productId) {
        return ResponseEntity.ok(service.markAsAuctionSold(productId));
    }
}
