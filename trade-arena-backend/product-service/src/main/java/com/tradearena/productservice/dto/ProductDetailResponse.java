package com.tradearena.productservice.dto;

import com.tradearena.productservice.model.Product;
import com.tradearena.productservice.model.ProductCondition;
import com.tradearena.productservice.model.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ProductDetailResponse {

    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private UUID categoryId;
    private UUID subCategoryId;
    private Long sellerId;
    private ProductStatus status;
    private ProductCondition condition;
    private Boolean quickBidEnabled;
    private LocalDateTime quickBidStartTime;
    private LocalDateTime quickBidEndTime;
    private BigDecimal quickBidStartingPrice;
    private List<ImageDto> images;
    private List<InformationDto> productInformation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class ImageDto {
        private UUID id;
        private String filename;
        private String mimeType;
        private String data;
        private Integer displayOrder;
        private Boolean isPrimary;

        public UUID getId()              { return id; }
        public String getFilename()      { return filename; }
        public String getMimeType()      { return mimeType; }
        public String getData()          { return data; }
        public Integer getDisplayOrder() { return displayOrder; }
        public Boolean getIsPrimary()    { return isPrimary; }
    }

    public static class InformationDto {
        private UUID id;
        private Integer formId;
        private String answer;

        public UUID getId()        { return id; }
        public Integer getFormId() { return formId; }
        public String getAnswer()  { return answer; }
    }

    public static ProductDetailResponse fromEntity(Product p) {
        ProductDetailResponse r = new ProductDetailResponse();
        r.id                    = p.getId();
        r.title                 = p.getTitle();
        r.description           = p.getDescription();
        r.price                 = p.getPrice();
        r.categoryId            = p.getCategoryId();
        r.subCategoryId         = p.getSubCategoryId();
        r.sellerId              = p.getSellerId();
        r.status                = p.getStatus();
        r.condition             = p.getCondition();
        r.quickBidEnabled       = p.getQuickBidEnabled();
        r.quickBidStartTime     = p.getQuickBidStartTime();
        r.quickBidEndTime       = p.getQuickBidEndTime();
        r.quickBidStartingPrice = p.getQuickBidStartingPrice();
        r.createdAt             = p.getCreatedAt();
        r.updatedAt             = p.getUpdatedAt();

        r.images = p.getImages().stream().map(img -> {
            ImageDto dto     = new ImageDto();
            dto.id           = img.getId();
            dto.filename     = img.getFilename();
            dto.mimeType     = img.getMimeType();
            dto.data         = Base64.getEncoder().encodeToString(img.getData());
            dto.displayOrder = img.getDisplayOrder();
            dto.isPrimary    = img.getIsPrimary();
            return dto;
        }).collect(Collectors.toList());

        r.productInformation = p.getProductInformation().stream().map(info -> {
            InformationDto dto = new InformationDto();
            dto.id     = info.getId();
            dto.formId = info.getFormId();
            dto.answer = info.getAnswer();
            return dto;
        }).collect(Collectors.toList());

        return r;
    }

    public UUID getId()                                 { return id; }
    public String getTitle()                            { return title; }
    public String getDescription()                      { return description; }
    public BigDecimal getPrice()                        { return price; }
    public UUID getCategoryId()                         { return categoryId; }
    public UUID getSubCategoryId()                      { return subCategoryId; }
    public Long getSellerId()                           { return sellerId; }
    public ProductStatus getStatus()                    { return status; }
    public ProductCondition getCondition()              { return condition; }
    public Boolean getQuickBidEnabled()                 { return quickBidEnabled; }
    public LocalDateTime getQuickBidStartTime()         { return quickBidStartTime; }
    public LocalDateTime getQuickBidEndTime()           { return quickBidEndTime; }
    public BigDecimal getQuickBidStartingPrice()        { return quickBidStartingPrice; }
    public List<ImageDto> getImages()                   { return images; }
    public List<InformationDto> getProductInformation() { return productInformation; }
    public LocalDateTime getCreatedAt()                 { return createdAt; }
    public LocalDateTime getUpdatedAt()                 { return updatedAt; }
}