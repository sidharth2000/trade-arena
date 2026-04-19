package com.tradearena.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponseDTO {

    private Long bidderId;
    private BigDecimal amount;
    private LocalDateTime placedAt;

    public BidResponseDTO() {}

    public BidResponseDTO(Long bidderId, BigDecimal amount, LocalDateTime placedAt) {
        this.bidderId = bidderId;
        this.amount = amount;
        this.placedAt = placedAt;
    }

    public Long getBidderId() {
        return bidderId;
    }

    public void setBidderId(Long bidderId) {
        this.bidderId = bidderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPlacedAt() {
        return placedAt;
    }

    public void setPlacedAt(LocalDateTime placedAt) {
        this.placedAt = placedAt;
    }
}