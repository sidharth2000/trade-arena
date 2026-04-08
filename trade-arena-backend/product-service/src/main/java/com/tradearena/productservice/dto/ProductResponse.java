package com.tradearena.productservice.dto;

import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO returned to the frontend and other microservices.
 * Maps Product entity to a clean API response.
 */
public class ProductResponse {

    private Long productId;
    private String title;
    private String description;
    private Double price;
    private ProductStatus status;
    private Integer sellerId;
    private Integer categoryId;
    private List<String> imageUrls;
    private String specificationValues;
    private Boolean auctionEnabled;
    private LocalDateTime auctionEndTime;
    private Double minimumBidPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -----------------------------------------------------------------------
    // Static factory
    // -----------------------------------------------------------------------

    public static ProductResponse fromEntity(Product p) {
        ProductResponse r = new ProductResponse();
        r.productId          = p.getProductId();
        r.title              = p.getTitle();
        r.description        = p.getDescription();
        r.price              = p.getPrice();
        r.status             = p.getStatus();
        r.sellerId           = p.getSellerId();
        r.categoryId         = p.getCategoryId();
        r.imageUrls          = p.getImageUrls();
        r.specificationValues = p.getSpecificationValues();
        r.auctionEnabled     = p.getAuctionEnabled();
        r.auctionEndTime     = p.getAuctionEndTime();
        r.minimumBidPrice    = p.getMinimumBidPrice();
        r.createdAt          = p.getCreatedAt();
        r.updatedAt          = p.getUpdatedAt();
        return r;
    }

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public ProductResponse() {}

    // -----------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------

    public Long getProductId()                                  { return productId; }
    public void setProductId(Long productId)                    { this.productId = productId; }

    public String getTitle()                                    { return title; }
    public void setTitle(String title)                          { this.title = title; }

    public String getDescription()                              { return description; }
    public void setDescription(String description)              { this.description = description; }

    public Double getPrice()                                    { return price; }
    public void setPrice(Double price)                          { this.price = price; }

    public ProductStatus getStatus()                            { return status; }
    public void setStatus(ProductStatus status)                 { this.status = status; }

    public Integer getSellerId()                                { return sellerId; }
    public void setSellerId(Integer sellerId)                   { this.sellerId = sellerId; }

    public Integer getCategoryId()                              { return categoryId; }
    public void setCategoryId(Integer categoryId)               { this.categoryId = categoryId; }

    public List<String> getImageUrls()                          { return imageUrls; }
    public void setImageUrls(List<String> imageUrls)            { this.imageUrls = imageUrls; }

    public String getSpecificationValues()                                  { return specificationValues; }
    public void setSpecificationValues(String specificationValues)          { this.specificationValues = specificationValues; }

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
