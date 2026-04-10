package com.tradearena.productservice.dto;

import com.tradearena.productservice.model.ProductStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class RemoveProductResponse {

    private UUID id;
    private ProductStatus status;
    private LocalDateTime updatedAt;

    public RemoveProductResponse(UUID id, ProductStatus status, LocalDateTime updatedAt) {
        this.id        = id;
        this.status    = status;
        this.updatedAt = updatedAt;
    }

    public UUID getId()                 { return id; }
    public ProductStatus getStatus()    { return status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}