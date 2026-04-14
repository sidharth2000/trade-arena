package com.tradearena.model;

public enum AuctionStatus {
    ACTIVE,           // Auction is live, bids coming in
    ENDED,            // Timer ended, awaiting seller decision
    PENDING_PAYMENT,  // Seller approved, waiting for winner to pay
    COMPLETED,        // Payment received, auction done
    CANCELLED         // Seller rejected all bids / no bids
}