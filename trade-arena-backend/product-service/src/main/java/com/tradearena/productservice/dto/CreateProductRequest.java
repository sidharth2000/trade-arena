package com.tradearena.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for creating a new product listing.
 * Received from the frontend via POST /api/products
 */
public class CreateProductRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be a positive value")
    private Double price;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    /**
     * Image URLs — uploaded by frontend to Cloudinary/ImgBB before submitting.
     * Product Service only stores the returned URLs.
     */
    private List<String> imageUrls = new ArrayList<>();

    /**
     * Serialised JSON of dynamic form responses filled by the seller.
     * Example: {"Brand":"Apple","Processor":"A16 Bionic","CPU GHz":"3.46"}
     * Structure matches CategoryForm fields for the selected categoryId.
     */
    private String specificationValues;

    /** Whether to enable Quick Bid (auction) mode immediately on creation */
    private Boolean auctionEnabled = false;

    /** Required when auctionEnabled = true */
    private LocalDateTime auctionEndTime;

    /** Required when auctionEnabled = true */
    private Double minimumBidPrice;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public CreateProductRequest() {}

    // -----------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------

    public String getTitle()                            { return title; }
    public void setTitle(String title)                  { this.title = title; }

    public String getDescription()                      { return description; }
    public void setDescription(String description)      { this.description = description; }

    public Double getPrice()                            { return price; }
    public void setPrice(Double price)                  { this.price = price; }

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
}
