package com.tradearena.adminservice.dto;

public class CategoryDto {

    private Integer categoryId;
    private String categoryName;
    private String categoryIcon;

    public CategoryDto() {}

    public CategoryDto(Integer categoryId, String categoryName, String categoryIcon) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryIcon = categoryIcon;
    }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
}