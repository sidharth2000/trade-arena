package com.tradearena.productservice.client;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Fallback for AdminServiceClient.
 * Returns safe empty responses when Admin Service is unavailable
 * so Product Service can still start and handle other requests.
 */
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
