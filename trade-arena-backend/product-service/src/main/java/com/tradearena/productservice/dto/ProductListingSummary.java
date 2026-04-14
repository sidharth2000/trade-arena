package com.tradearena.productservice.dto;

import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductCondition;
import com.tradearena.productservice.model.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ProductListingSummary {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer categoryId;
    private Integer subCategoryId;
    private Long sellerId;
    private ProductStatus status;
    private ProductCondition condition;
    private Boolean quickBidEnabled;
    private UUID primaryImageId;
    private LocalDateTime createdAt;

    public static ProductListingSummary fromEntity(Product p) {
        ProductListingSummary s = new ProductListingSummary();
        s.id              = p.getId();
        s.title           = p.getTitle();
        s.description     = p.getDescription();
        s.price           = p.getPrice();
        s.categoryId      = p.getCategoryId();
        s.subCategoryId   = p.getSubCategoryId();
        s.sellerId        = p.getSellerId();
        s.status          = p.getStatus();
        s.condition       = p.getCondition();
        s.quickBidEnabled = p.getQuickBidEnabled();
        s.createdAt       = p.getCreatedAt();

        p.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .ifPresent(img -> s.primaryImageId = img.getId());

        return s;
    }

    public UUID getId()                 { return id; }
    public String getTitle()            { return title; }
    public String getDescription()      { return description; }
    public BigDecimal getPrice()        { return price; }
    public Integer getCategoryId()         { return categoryId; }
    public Integer getSubCategoryId()      { return subCategoryId; }
    public Long getSellerId()           { return sellerId; }
    public ProductStatus getStatus()    { return status; }
    public ProductCondition getCondition() { return condition; }
    public Boolean getQuickBidEnabled() { return quickBidEnabled; }
    public UUID getPrimaryImageId()     { return primaryImageId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}