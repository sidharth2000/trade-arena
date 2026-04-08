package com.tradearena.productservice.service;

import com.tradearena.productservice.client.AdminServiceClient;
import com.tradearena.productservice.dto.*;
import com.tradearena.productservice.exception.ProductNotFoundException;
import com.tradearena.productservice.exception.UnauthorisedActionException;
import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;
import com.tradearena.productservice.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository repository;
    private final AdminServiceClient adminClient;

    public ProductService(ProductRepository repository, AdminServiceClient adminClient) {
        this.repository  = repository;
        this.adminClient = adminClient;
    }

    // -----------------------------------------------------------------------
    // CREATE
    // -----------------------------------------------------------------------

    /**
     * Create a new product listing.
     * sellerId comes from the X-User-Id header forwarded by the API Gateway.
     */
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request, Integer sellerId) {
        validateAuctionFields(request.getAuctionEnabled(), request.getAuctionEndTime(), request.getMinimumBidPrice());

        Product product = new Product();
        product.setSellerId(sellerId);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategoryId(request.getCategoryId());
        product.setImageUrls(request.getImageUrls());
        product.setSpecificationValues(request.getSpecificationValues());

        if (Boolean.TRUE.equals(request.getAuctionEnabled())) {
            product.setAuctionEnabled(true);
            product.setStatus(ProductStatus.AUCTION);
            product.setAuctionEndTime(request.getAuctionEndTime());
            product.setMinimumBidPrice(request.getMinimumBidPrice());
        } else {
            product.setAuctionEnabled(false);
            product.setStatus(ProductStatus.ACTIVE);
        }

        return ProductResponse.fromEntity(repository.save(product));
    }

    // -----------------------------------------------------------------------
    // READ
    // -----------------------------------------------------------------------

    /** Get a single product by ID */
    public ProductResponse getProductById(Long productId) {
        return ProductResponse.fromEntity(findOrThrow(productId));
    }

    /** Get all listings by a seller */
    public List<ProductResponse> getProductsBySeller(Integer sellerId) {
        return repository.findBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /** Browse all active listings — paginated */
    public PagedResponse<ProductResponse> getActiveListings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result = repository
                .findByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, pageable)
                .map(ProductResponse::fromEntity);
        return PagedResponse.from(result);
    }

    /** Browse active listings by category — paginated */
    public PagedResponse<ProductResponse> getListingsByCategory(Integer categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result = repository
                .findByCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, ProductStatus.ACTIVE, pageable)
                .map(ProductResponse::fromEntity);
        return PagedResponse.from(result);
    }

    /** Search listings by keyword, optionally filtered by category — paginated */
    public PagedResponse<ProductResponse> searchProducts(String keyword, Integer categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result;

        if (categoryId != null) {
            result = repository.searchByKeywordAndCategory(keyword, categoryId, ProductStatus.ACTIVE, pageable)
                    .map(ProductResponse::fromEntity);
        } else {
            result = repository.searchByKeyword(keyword, ProductStatus.ACTIVE, pageable)
                    .map(ProductResponse::fromEntity);
        }
        return PagedResponse.from(result);
    }

    /** Browse active auction listings — paginated */
    public PagedResponse<ProductResponse> getAuctionListings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> result = repository
                .findByStatusAndAuctionEnabledTrueOrderByAuctionEndTimeAsc(ProductStatus.AUCTION, pageable)
                .map(ProductResponse::fromEntity);
        return PagedResponse.from(result);
    }

    /**
     * Get category form fields from Admin Service.
     * Frontend uses this to render the dynamic specification form when a seller
     * selects a category/subcategory before creating a listing.
     */
    public Object getCategoryForm(Integer categoryId) {
        return adminClient.getCategoryForm(categoryId);
    }

    // -----------------------------------------------------------------------
    // UPDATE
    // -----------------------------------------------------------------------

    /**
     * Update a product listing.
     * Only the seller who owns the listing can update it.
     */
    @Transactional
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request, Integer sellerId) {
        Product product = findOrThrow(productId);
        assertOwner(product, sellerId);

        if (request.getTitle() != null)                 product.setTitle(request.getTitle());
        if (request.getDescription() != null)           product.setDescription(request.getDescription());
        if (request.getPrice() != null)                 product.setPrice(request.getPrice());
        if (request.getImageUrls() != null)             product.setImageUrls(request.getImageUrls());
        if (request.getSpecificationValues() != null)   product.setSpecificationValues(request.getSpecificationValues());

        return ProductResponse.fromEntity(repository.save(product));
    }

    /**
     * Enable Quick Bid (auction) mode on an existing listing.
     * Switches status from ACTIVE to AUCTION.
     */
    @Transactional
    public ProductResponse enableAuction(Long productId, EnableAuctionRequest request, Integer sellerId) {
        Product product = findOrThrow(productId);
        assertOwner(product, sellerId);

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new IllegalStateException("Auction mode can only be enabled on ACTIVE listings");
        }
        if (request.getAuctionEndTime().isBefore(LocalDateTime.now().plusMinutes(5))) {
            throw new IllegalArgumentException("Auction end time must be at least 5 minutes in the future");
        }

        product.setAuctionEnabled(true);
        product.setStatus(ProductStatus.AUCTION);
        product.setAuctionEndTime(request.getAuctionEndTime());
        product.setMinimumBidPrice(request.getMinimumBidPrice());

        return ProductResponse.fromEntity(repository.save(product));
    }

    /**
     * Mark a product as SOLD (fixed-price purchase completed).
     * Called internally by the Bidding/Order service.
     */
    @Transactional
    public ProductResponse markAsSold(Long productId) {
        Product product = findOrThrow(productId);
        product.setStatus(ProductStatus.SOLD);
        return ProductResponse.fromEntity(repository.save(product));
    }

    /**
     * Mark a product as AUCTION_SOLD (auction winner confirmed payment).
     * Called internally by the Bidding/Camunda service.
     */
    @Transactional
    public ProductResponse markAsAuctionSold(Long productId) {
        Product product = findOrThrow(productId);
        product.setStatus(ProductStatus.AUCTION_SOLD);
        return ProductResponse.fromEntity(repository.save(product));
    }

    // -----------------------------------------------------------------------
    // DELETE
    // -----------------------------------------------------------------------

    /**
     * Deactivate (soft-delete) a listing.
     * Sets status to INACTIVE rather than deleting the row,
     * preserving audit trail and bid history references.
     */
    @Transactional
    public void deactivateProduct(Long productId, Integer sellerId) {
        Product product = findOrThrow(productId);
        assertOwner(product, sellerId);
        product.setStatus(ProductStatus.INACTIVE);
        repository.save(product);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private Product findOrThrow(Long productId) {
        return repository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + productId));
    }

    private void assertOwner(Product product, Integer sellerId) {
        if (!product.getSellerId().equals(sellerId)) {
            throw new UnauthorisedActionException("You are not the owner of this listing");
        }
    }

    private void validateAuctionFields(Boolean auctionEnabled, LocalDateTime endTime, Double minBid) {
        if (Boolean.TRUE.equals(auctionEnabled)) {
            if (endTime == null) {
                throw new IllegalArgumentException("auctionEndTime is required when auctionEnabled is true");
            }
            if (minBid == null) {
                throw new IllegalArgumentException("minimumBidPrice is required when auctionEnabled is true");
            }
            if (endTime.isBefore(LocalDateTime.now().plusMinutes(5))) {
                throw new IllegalArgumentException("Auction end time must be at least 5 minutes in the future");
            }
        }
    }
}
