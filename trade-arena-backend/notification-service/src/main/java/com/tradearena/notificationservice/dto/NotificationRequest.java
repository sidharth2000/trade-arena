package com.tradearena.notificationservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class NotificationRequest {

    @NotNull
    private Long userId;

    @Email
    private String userEmail;

    @NotBlank
    private String message;

    @NotBlank
    private String type;

    /**
     * If true, NotificationService will attempt to send email for eligible types.
     */
    private boolean sendEmail = false;

    // Optional event details used in email templates
    private String productTitle;
    private BigDecimal bidAmount;
    private LocalDateTime paymentDeadline;
    private Long auctionId;

    public NotificationRequest() {}

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getMessage() {
        return message;
    }

    public String getType() {
        return type;
    }

    public boolean isSendEmail() {
        return sendEmail;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    public LocalDateTime getPaymentDeadline() {
        return paymentDeadline;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setSendEmail(boolean sendEmail) {
        this.sendEmail = sendEmail;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }

    public void setPaymentDeadline(LocalDateTime paymentDeadline) {
        this.paymentDeadline = paymentDeadline;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }
}