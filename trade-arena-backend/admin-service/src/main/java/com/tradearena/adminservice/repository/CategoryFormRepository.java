package com.tradearena.adminservice.repository;

import com.tradearena.adminservice.models.Category;
import com.tradearena.adminservice.models.CategoryForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryFormRepository extends JpaRepository<CategoryForm, Integer> {
    List<CategoryForm> findByCategory(Category category);
    void deleteByCategory(Category category);
}