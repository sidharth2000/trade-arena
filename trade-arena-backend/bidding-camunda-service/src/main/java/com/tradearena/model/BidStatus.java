package com.tradearena.model;


public enum BidStatus {
    ACTIVE,          // Live bid during auction
    OUTBID,          // Someone bid higher
    PENDING_PAYMENT, // Seller approved, awaiting payment in 24hrs
    PAID,            // Payment confirmed — done
    FAILED,          // 24hr window expired, buyer didn't pay
    REJECTED,        // Seller rejected this bid
    CANCELLED        // Auction ended with no sale
}
