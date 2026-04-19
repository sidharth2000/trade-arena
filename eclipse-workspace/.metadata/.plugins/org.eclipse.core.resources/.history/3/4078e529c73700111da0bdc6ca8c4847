package com.tradearena.productservice.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class AdminServiceClientFallback implements AdminServiceClient {

    @Override
    public Map<String, Object> getCategoryById(Integer categoryId) {
        return Collections.emptyMap();
    }

    @Override
    public List<Map<String, Object>> getCategoryForm(Integer categoryId) {
        return Collections.emptyList();
    }
}
