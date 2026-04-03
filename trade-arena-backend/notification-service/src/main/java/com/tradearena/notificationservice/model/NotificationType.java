package com.tradearena.notificationservice.model;

/**
 * Enum representing all possible notification types in Trade Arena.
 *
 * EMAIL_REQUIRED flag logic is handled in NotificationService
 * based on which types warrant an email (critical events only).
 */
public enum NotificationType {

    /** A buyer placed a bid on seller's product */
    BID_PLACED,

    /** A buyer has been outbid by another buyer */
    OUTBID,

    /** Buyer won the auction (highest bidder when auction ended) */
    AUCTION_WIN,

    /** Seller's auction has ended */
    AUCTION_ENDED,

    /** Reminder to winning buyer: pay within 24 hours */
    PAYMENT_REMINDER,

    /** Payment was completed successfully — sent to both buyer and seller */
    PAYMENT_SUCCESS,

    /** Buyer's account restricted due to missed payment (3+ defaults) */
    ACCOUNT_RESTRICTED,

    /** Next highest bidder is offered the item after winner failed to pay */
    FALLBACK_OFFER,

    /** Generic new listing notification (for future use) */
    NEW_LISTING
}
