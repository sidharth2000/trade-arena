package com.tradearena.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class StartAuctionDTO {

    private UUID productId;
    private LocalDateTime auctionEndTime;
    private Double startingPrice;
    private Integer sellerId;

    public Integer getSellerId() {
		return sellerId;
	}

	public void setSellerId(Integer sellerId) {
		this.sellerId = sellerId;
	}

	public StartAuctionDTO() {}

    public StartAuctionDTO(UUID productId, LocalDateTime auctionEndTime, Double startingPrice) {
        this.productId = productId;
        this.auctionEndTime = auctionEndTime;
        this.startingPrice = startingPrice;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public LocalDateTime getAuctionEndTime() {
        return auctionEndTime;
    }

    public void setAuctionEndTime(LocalDateTime auctionEndTime) {
        this.auctionEndTime = auctionEndTime;
    }

    public Double getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(Double startingPrice) {
        this.startingPrice = startingPrice;
    }
}