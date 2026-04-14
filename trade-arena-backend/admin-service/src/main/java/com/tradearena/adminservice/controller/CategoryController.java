package com.tradearena.adminservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tradearena.adminservice.dto.ApiResponse;
import com.tradearena.adminservice.dto.CategoryRequestDto;
import com.tradearena.adminservice.service.CategoryService;

@RestController
@RequestMapping("/admin")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/category")
    public ResponseEntity<ApiResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }
    
    @PostMapping("/savecategoryconfig")
    public ResponseEntity<ApiResponse> saveCategory(
            @RequestBody CategoryRequestDto request,
            @RequestHeader("X-User-Id") String adminId
    ) {
        return categoryService.saveCategory(request, Integer.parseInt(adminId));
    }
    
    @GetMapping("/subcategories/{parentCategoryId}")
    public ResponseEntity<ApiResponse> getSubCategories(
            @PathVariable Integer parentCategoryId
    ) {
        return categoryService.getSubCategories(parentCategoryId);
    }
    
    @GetMapping("/subcategoryquestions/{subCategoryId}")
    public ResponseEntity<ApiResponse> getQuestionsBySubCategory(
            @PathVariable Integer subCategoryId
    ) {
        return categoryService.getQuestionsBySubCategory(subCategoryId);
    }
}