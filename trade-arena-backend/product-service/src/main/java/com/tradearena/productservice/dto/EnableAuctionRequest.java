package com.tradearena.productservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * DTO for enabling Quick Bid (auction) mode on an existing listing.
 * Called via PUT /api/products/{productId}/auction
 */
public class EnableAuctionRequest {

    @NotNull(message = "Auction end time is required")
    private LocalDateTime auctionEndTime;

    @NotNull(message = "Minimum bid price is required")
    @Min(value = 1, message = "Minimum bid price must be at least €1")
    private Double minimumBidPrice;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public EnableAuctionRequest() {}

    public EnableAuctionRequest(LocalDateTime auctionEndTime, Double minimumBidPrice) {
        this.auctionEndTime = auctionEndTime;
        this.minimumBidPrice = minimumBidPrice;
    }

    // -----------------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------------

    public LocalDateTime getAuctionEndTime()                        { return auctionEndTime; }
    public void setAuctionEndTime(LocalDateTime auctionEndTime)     { this.auctionEndTime = auctionEndTime; }

    public Double getMinimumBidPrice()                          { return minimumBidPrice; }
    public void setMinimumBidPrice(Double minimumBidPrice)      { this.minimumBidPrice = minimumBidPrice; }
}
