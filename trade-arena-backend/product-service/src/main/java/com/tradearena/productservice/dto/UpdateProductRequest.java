package com.tradearena.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for updating an existing product listing.
 * All fields are optional — only non-null fields are updated (PATCH semantics).
 */
public class UpdateProductRequest {

    @Size(max = 200, message = "Title must be under 200 characters")
    private String title;

    private String description;

    @Min(value = 0, message = "Price must be a positive value")
    private Double price;

    private List<String> imageUrls;

    private String specificationValues;

    // -----------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------

    public String getTitle()                            { return title; }
    public void setTitle(String title)                  { this.title = title; }

    public String getDescription()                      { return description; }
    public void setDescription(String description)      { this.description = description; }

    public Double getPrice()                            { return price; }
    public void setPrice(Double price)                  { this.price = price; }

    public List<String> getImageUrls()                  { return imageUrls; }
    public void setImageUrls(List<String> imageUrls)    { this.imageUrls = imageUrls; }

    public String getSpecificationValues()                              { return specificationValues; }
    public void setSpecificationValues(String specificationValues)      { this.specificationValues = specificationValues; }
}
