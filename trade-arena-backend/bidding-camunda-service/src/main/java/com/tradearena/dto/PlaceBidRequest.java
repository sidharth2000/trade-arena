package com.tradearena.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PlaceBidRequest {

    private UUID productId;
    private Long bidderId;
    private BigDecimal amount;

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public Long getBidderId() { return bidderId; }
    public void setBidderId(Long bidderId) { this.bidderId = bidderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}