package com.tradearena.productservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

/**
 * OpenFeign client for Admin Service.
 *
 * Used to:
 * 1. Validate that a categoryId exists before creating a product listing.
 * 2. Fetch the dynamic form fields for a category so the frontend
 *    knows what specification fields are required.
 *
 * The name "admin-service" must match the spring.application.name
 * registered in Eureka by the Admin Service.
 */
@FeignClient(name = "admin-service", fallback = AdminServiceClientFallback.class)
public interface AdminServiceClient {

    /**
     * Check if a category exists.
     * Returns the category details map or throws FeignException if not found.
     */
    @GetMapping("/admin/categories/{categoryId}")
    Map<String, Object> getCategoryById(@PathVariable("categoryId") Integer categoryId);

    /**
     * Get the dynamic form fields configured for a category.
     * Returns a list of form field maps, each with question, responseType, required, options.
     */
    @GetMapping("/admin/categories/{categoryId}/form")
    List<Map<String, Object>> getCategoryForm(@PathVariable("categoryId") Integer categoryId);
}
