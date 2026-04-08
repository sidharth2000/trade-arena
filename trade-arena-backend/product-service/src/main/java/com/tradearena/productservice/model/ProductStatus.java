package com.tradearena.productservice.model;

/**
 * Lifecycle status of a product listing in Trade Arena.
 */
public enum ProductStatus {

    /** Listing is live and visible to buyers */
    ACTIVE,

    /** Seller has enabled Quick Bid — listing is in auction mode */
    AUCTION,

    /** Listing has been sold (fixed price purchase completed) */
    SOLD,

    /** Auction ended and item was sold to the highest bidder */
    AUCTION_SOLD,

    /** Listing expired without a sale */
    EXPIRED,

    /** Seller manually deactivated the listing */
    INACTIVE
}
