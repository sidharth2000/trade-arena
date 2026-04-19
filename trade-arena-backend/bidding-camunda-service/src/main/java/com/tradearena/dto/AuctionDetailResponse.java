package com.tradearena.dto;

import com.tradearena.model.AuctionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AuctionDetailResponse {

    private UUID auctionId;
    private UUID productId;
    private Long sellerId;

    private AuctionStatus status;

    private BigDecimal startingPrice;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private List<BidDTO> bids;

    // getters/setters

    public static class BidDTO {
        private UUID bidId;
        private Long bidderId;
        private BigDecimal amount;
        private LocalDateTime placedAt;

        public BidDTO(UUID bidId, Long bidderId, BigDecimal amount, LocalDateTime placedAt) {
            this.bidId = bidId;
            this.bidderId = bidderId;
            this.amount = amount;
            this.placedAt = placedAt;
        }

		public UUID getBidId() {
			return bidId;
		}

		public void setBidId(UUID bidId) {
			this.bidId = bidId;
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

	public UUID getAuctionId() {
		return auctionId;
	}

	public void setAuctionId(UUID auctionId) {
		this.auctionId = auctionId;
	}

	public UUID getProductId() {
		return productId;
	}

	public void setProductId(UUID productId) {
		this.productId = productId;
	}

	public Long getSellerId() {
		return sellerId;
	}

	public void setSellerId(Long sellerId) {
		this.sellerId = sellerId;
	}

	public AuctionStatus getStatus() {
		return status;
	}

	public void setStatus(AuctionStatus status) {
		this.status = status;
	}

	public BigDecimal getStartingPrice() {
		return startingPrice;
	}

	public void setStartingPrice(BigDecimal startingPrice) {
		this.startingPrice = startingPrice;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public List<BidDTO> getBids() {
		return bids;
	}

	public void setBids(List<BidDTO> bids) {
		this.bids = bids;
	}
    
    
}