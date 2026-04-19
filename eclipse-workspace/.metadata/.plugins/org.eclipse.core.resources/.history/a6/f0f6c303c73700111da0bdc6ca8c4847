package com.tradearena.productservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "admin-service", fallback = AdminServiceClientFallback.class)
public interface AdminServiceClient {

    @GetMapping("/admin/categories/{categoryId}")
    Map<String, Object> getCategoryById(@PathVariable("categoryId") Integer categoryId);

    @GetMapping("/admin/categories/{categoryId}/form")
    List<Map<String, Object>> getCategoryForm(@PathVariable("categoryId") Integer categoryId);
}
