package com.tradearena.adminservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tradearena.adminservice.models.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByParentCategoryIsNull();
    List<Category> findByParentCategory(Category parentCategory);
    Optional<Category> findByCategoryNameIgnoreCase(String categoryName);
    Optional<Category> findByCategoryNameIgnoreCaseAndParentCategory(String categoryName, Category parentCategory);
}