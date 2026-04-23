package com.tradearena.notificationservice.model;

public enum NotificationType {

    BID_PLACED,

    OUTBID,

    AUCTION_WIN,

    AUCTION_ENDED,

    PAYMENT_REMINDER,

    PAYMENT_SUCCESS,

    ACCOUNT_RESTRICTED,

    FALLBACK_OFFER,

    NEW_LISTING,
    
    BID_CONFIRMATION, // mail to bid placer
}
