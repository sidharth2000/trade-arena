package com.tradearena.adminservice.service;

import org.springframework.http.ResponseEntity;

import com.tradearena.adminservice.dto.ApiResponse;
import com.tradearena.adminservice.dto.CategoryRequestDto;

public interface CategoryService {
    ResponseEntity<ApiResponse> getAllCategories();
    ResponseEntity<ApiResponse> saveCategory(CategoryRequestDto request, Integer adminId);
    ResponseEntity<ApiResponse> getSubCategories(Integer parentCategoryId);
    ResponseEntity<ApiResponse> getQuestionsBySubCategory(Integer subCategoryId);
}