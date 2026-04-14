package com.tradearena.productservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateProductStatusRequest {

    private UUID productId;
    private String status;
    private LocalDateTime auctionStartTime;
    private LocalDateTime auctionEndTime;
    private BigDecimal startingPrice;

    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAuctionStartTime() { return auctionStartTime; }
    public void setAuctionStartTime(LocalDateTime auctionStartTime) { this.auctionStartTime = auctionStartTime; }

    public LocalDateTime getAuctionEndTime() { return auctionEndTime; }
    public void setAuctionEndTime(LocalDateTime auctionEndTime) { this.auctionEndTime = auctionEndTime; }

    public BigDecimal getStartingPrice() { return startingPrice; }
    public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }
}