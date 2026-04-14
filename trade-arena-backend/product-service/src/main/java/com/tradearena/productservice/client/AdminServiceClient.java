package com.tradearena.productservice.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "admin-service")
public interface AdminServiceClient {

    @GetMapping("/admin/category")
    Map<String, Object> getAllCategories();

    @GetMapping("/admin/subcategories/{parentCategoryId}")
    Map<String, Object> getSubCategories(@PathVariable("parentCategoryId") Integer parentCategoryId);

    @GetMapping("/admin/subcategoryquestions/{subCategoryId}")
    Map<String, Object> getQuestions(@PathVariable("subCategoryId") Integer subCategoryId);
}
