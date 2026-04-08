package com.tradearena.productservice.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core entity representing a product listing in Trade Arena.
 *
 * Design decisions:
 * - sellerId is a plain Integer (from X-User-Id header forwarded by API Gateway)
 *   — NOT a JPA relationship, as User lives in a different service/database.
 * - categoryId is a plain Integer reference to Admin Service's Category table
 *   — NOT a JPA relationship, for the same reason (database-per-service pattern).
 * - imageUrls stored as a simple list of URL strings (no separate image table needed for MVP).
 * - specificationValues stored as JSON text — the dynamic form responses filled by the seller.
 *   The structure matches CategoryForm fields configured in Admin Service.
 */
@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_seller_id",    columnList = "seller_id"),
                @Index(name = "idx_products_category_id",  columnList = "category_id"),
                @Index(name = "idx_products_status",       columnList = "status"),
                @Index(name = "idx_products_created_at",   columnList = "created_at")
        }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    /** Title shown in the listing card */
    @Column(nullable = false, length = 200)
    private String title;

    /** Full description of the product */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Asking price in EUR */
    @Column(nullable = false)
    private Double price;

    /** Current lifecycle status */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    /**
     * ID of the seller — sourced from X-User-Id header (forwarded by API Gateway).
     * Matches User.userId in Auth Service.
     */
    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;

    /**
     * ID of the category/subcategory selected by the seller.
     * References Category.categoryId in Admin Service.
     */
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    /**
     * Product image URLs — uploaded externally (e.g. Cloudinary) by the frontend.
     * Stored as a simple list of URL strings.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();

    /**
     * Dynamic specification values filled by the seller.
     * Stored as a JSON string: { "Brand": "Apple", "Processor": "A16", "CPU GHz": "3.46" }
     * Structure matches CategoryForm fields defined in Admin Service for this categoryId.
     */
    @Column(name = "specification_values", columnDefinition = "TEXT")
    private String specificationValues;

    /**
     * Whether this listing has auction/Quick Bid mode enabled.
     * When true, the Bidding Service manages the auction lifecycle.
     */
    @Column(name = "auction_enabled", nullable = false)
    private Boolean auctionEnabled = false;

    /**
     * When the auction ends (set by seller when enabling auction mode).
     * Null if auctionEnabled is false.
     */
    @Column(name = "auction_end_time")
    private LocalDateTime auctionEndTime;

    /**
     * Minimum bid price for Quick Bid auctions.
     * Null if auctionEnabled is false.
     */
    @Column(name = "minimum_bid_price")
    private Double minimumBidPrice;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public Product() {}

    // -----------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------

    public Long getProductId()                          { return productId; }
    public void setProductId(Long productId)            { this.productId = productId; }

    public String getTitle()                            { return title; }
    public void setTitle(String title)                  { this.title = title; }

    public String getDescription()                      { return description; }
    public void setDescription(String description)      { this.description = description; }

    public Double getPrice()                            { return price; }
    public void setPrice(Double price)                  { this.price = price; }

    public ProductStatus getStatus()                    { return status; }
    public void setStatus(ProductStatus status)         { this.status = status; }

    public Integer getSellerId()                        { return sellerId; }
    public void setSellerId(Integer sellerId)           { this.sellerId = sellerId; }

    public Integer getCategoryId()                      { return categoryId; }
    public void setCategoryId(Integer categoryId)       { this.categoryId = categoryId; }

    public List<String> getImageUrls()                  { return imageUrls; }
    public void setImageUrls(List<String> imageUrls)    { this.imageUrls = imageUrls; }

    public String getSpecificationValues()                              { return specificationValues; }
    public void setSpecificationValues(String specificationValues)      { this.specificationValues = specificationValues; }

    public Boolean getAuctionEnabled()                          { return auctionEnabled; }
    public void setAuctionEnabled(Boolean auctionEnabled)       { this.auctionEnabled = auctionEnabled; }

    public LocalDateTime getAuctionEndTime()                        { return auctionEndTime; }
    public void setAuctionEndTime(LocalDateTime auctionEndTime)     { this.auctionEndTime = auctionEndTime; }

    public Double getMinimumBidPrice()                          { return minimumBidPrice; }
    public void setMinimumBidPrice(Double minimumBidPrice)      { this.minimumBidPrice = minimumBidPrice; }

    public LocalDateTime getCreatedAt()                         { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt)           { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt()                         { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt)           { this.updatedAt = updatedAt; }
}
