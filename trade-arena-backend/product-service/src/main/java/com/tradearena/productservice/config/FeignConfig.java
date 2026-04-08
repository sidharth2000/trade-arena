package com.tradearena.productservice.config;

import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Feign client configuration.
 * Provides a custom error decoder so that when Admin Service returns
 * a 404 (category not found), Product Service translates it into a
 * meaningful IllegalArgumentException rather than a generic Feign error.
 */
@Configuration
public class FeignConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            if (response.status() == 404) {
                return new IllegalArgumentException(
                        "Category not found in Admin Service (status 404). " +
                        "Please select a valid category.");
            }
            if (response.status() == 503 || response.status() == 500) {
                return new IllegalStateException(
                        "Admin Service is currently unavailable. Please try again shortly.");
            }
            return new Exception("Admin Service error: HTTP " + response.status());
        };
    }
}
