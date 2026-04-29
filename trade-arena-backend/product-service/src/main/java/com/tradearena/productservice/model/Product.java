package com.tradearena.productservice.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_seller_id",   columnList = "seller_id"),
                @Index(name = "idx_products_category_id", columnList = "category_id"),
                @Index(name = "idx_products_status",      columnList = "status"),
                @Index(name = "idx_products_created_at",  columnList = "created_at")
        }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(nullable = false)
    private Integer categoryId;

    @Column(nullable = false)
    private Integer subCategoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCondition condition = ProductCondition.USED;

    @Column(nullable = false)
    private Boolean quickBidEnabled = false;

    @Column
    private LocalDateTime quickBidStartTime;

    @Column
    private LocalDateTime quickBidEndTime;

    @Column(precision = 19, scale = 4)
    private BigDecimal quickBidStartingPrice;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductInformation> productInformation = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Product() {}

    public void addImage(ProductImage image) {
        image.setProduct(this);
        this.images.add(image);
    }

    public void removeImage(ProductImage image) {
        image.setProduct(null);
        this.images.remove(image);
    }

    public UUID getId()                                     { return id; }
    public String getTitle()                                { return title; }
    public void setTitle(String title)                      { this.title = title; }
    public String getDescription()                          { return description; }
    public void setDescription(String description)          { this.description = description; }
    public BigDecimal getPrice()                            { return price; }
    public void setPrice(BigDecimal price)                  { this.price = price; }
    public Long getSellerId()                               { return sellerId; }
    public void setSellerId(Long sellerId)                  { this.sellerId = sellerId; }
    public Integer getCategoryId()                             { return categoryId; }
    public void setCategoryId(Integer categoryId)              { this.categoryId = categoryId; }
    public Integer getSubCategoryId()                          { return subCategoryId; }
    public void setSubCategoryId(Integer subCategoryId)        { this.subCategoryId = subCategoryId; }
    public ProductStatus getStatus()                        { return status; }
    public void setStatus(ProductStatus status)             { this.status = status; }
    public ProductCondition getCondition()                  { return condition; }
    public void setCondition(ProductCondition condition)    { this.condition = condition; }
    public Boolean getQuickBidEnabled()                     { return quickBidEnabled; }
    public void setQuickBidEnabled(Boolean q)               { this.quickBidEnabled = q; }
    public LocalDateTime getQuickBidStartTime()             { return quickBidStartTime; }
    public void setQuickBidStartTime(LocalDateTime t)       { this.quickBidStartTime = t; }
    public LocalDateTime getQuickBidEndTime()               { return quickBidEndTime; }
    public void setQuickBidEndTime(LocalDateTime t)         { this.quickBidEndTime = t; }
    public BigDecimal getQuickBidStartingPrice()            { return quickBidStartingPrice; }
    public void setQuickBidStartingPrice(BigDecimal p)      { this.quickBidStartingPrice = p; }
    public List<ProductImage> getImages()                   { return images; }
    public void setImages(List<ProductImage> images)        { this.images = images; }
    public List<ProductInformation> getProductInformation() { return productInformation; }
    public void setProductInformation(List<ProductInformation> pi) { this.productInformation = pi; }
    public LocalDateTime getCreatedAt()                     { return createdAt; }
    public LocalDateTime getUpdatedAt()                     { return updatedAt; }
}