package com.tradearena.notificationservice.dto;

import com.tradearena.notificationservice.model.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class NotificationRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @Email(message = "userEmail must be a valid email address")
    private String userEmail;

    private List<String> to;

    private List<String> cc;

    private String htmlBody;

    @NotBlank(message = "message is required")
    private String message;

    @NotNull(message = "type is required")
    private NotificationType type;

    private boolean sendEmail = false;

    private Long referenceId;

    private String productTitle;

    private Double bidAmount;

    private Long auctionId;

    private LocalDateTime paymentDeadline;


    public NotificationRequest() {}

    public NotificationRequest(Long userId, String userEmail, String message,
                               NotificationType type, boolean sendEmail,
                               Long referenceId, String productTitle,
                               Double bidAmount, Long auctionId,
                               LocalDateTime paymentDeadline) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.message = message;
        this.type = type;
        this.sendEmail = sendEmail;
        this.referenceId = referenceId;
        this.productTitle = productTitle;
        this.bidAmount = bidAmount;
        this.auctionId = auctionId;
        this.paymentDeadline = paymentDeadline;
    }


    public Long getUserId()                     { return userId; }
    public void setUserId(Long userId)          { this.userId = userId; }

    public String getUserEmail()                { return userEmail; }
    public void setUserEmail(String userEmail)  { this.userEmail = userEmail; }

    public List<String> getTo()                 { return to; }
    public void setTo(List<String> to)          { this.to = to; }

    public List<String> getCc()                 { return cc; }
    public void setCc(List<String> cc)          { this.cc = cc; }

    public String getHtmlBody()                 { return htmlBody; }
    public void setHtmlBody(String htmlBody)    { this.htmlBody = htmlBody; }

    public String getMessage()                  { return message; }
    public void setMessage(String message)      { this.message = message; }

    public NotificationType getType()           { return type; }
    public void setType(NotificationType type)  { this.type = type; }

    public boolean isSendEmail()                { return sendEmail; }
    public void setSendEmail(boolean sendEmail) { this.sendEmail = sendEmail; }

    public Long getReferenceId()                        { return referenceId; }
    public void setReferenceId(Long referenceId)        { this.referenceId = referenceId; }

    public String getProductTitle()                     { return productTitle; }
    public void setProductTitle(String productTitle)    { this.productTitle = productTitle; }

    public Double getBidAmount()                        { return bidAmount; }
    public void setBidAmount(Double bidAmount)          { this.bidAmount = bidAmount; }

    public Long getAuctionId()                          { return auctionId; }
    public void setAuctionId(Long auctionId)            { this.auctionId = auctionId; }

    public LocalDateTime getPaymentDeadline()                       { return paymentDeadline; }
    public void setPaymentDeadline(LocalDateTime paymentDeadline)   { this.paymentDeadline = paymentDeadline; }


    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long userId;
        private String userEmail;
        private List<String> to;
        private List<String> cc;
        private String htmlBody;
        private String message;
        private NotificationType type;
        private boolean sendEmail = false;
        private Long referenceId;
        private String productTitle;
        private Double bidAmount;
        private Long auctionId;
        private LocalDateTime paymentDeadline;

        public Builder userId(Long userId)                            { this.userId = userId; return this; }
        public Builder userEmail(String userEmail)                    { this.userEmail = userEmail; return this; }
        public Builder to(List<String> to)                            { this.to = to; return this; }
        public Builder cc(List<String> cc)                            { this.cc = cc; return this; }
        public Builder htmlBody(String htmlBody)                      { this.htmlBody = htmlBody; return this; }
        public Builder message(String message)                        { this.message = message; return this; }
        public Builder type(NotificationType type)                    { this.type = type; return this; }
        public Builder sendEmail(boolean sendEmail)                   { this.sendEmail = sendEmail; return this; }
        public Builder referenceId(Long referenceId)                  { this.referenceId = referenceId; return this; }
        public Builder productTitle(String productTitle)              { this.productTitle = productTitle; return this; }
        public Builder bidAmount(Double bidAmount)                    { this.bidAmount = bidAmount; return this; }
        public Builder auctionId(Long auctionId)                      { this.auctionId = auctionId; return this; }
        public Builder paymentDeadline(LocalDateTime paymentDeadline) { this.paymentDeadline = paymentDeadline; return this; }

        public NotificationRequest build() {
            NotificationRequest req = new NotificationRequest(userId, userEmail, message, type,
                    sendEmail, referenceId, productTitle, bidAmount, auctionId, paymentDeadline);
            req.setTo(to);
            req.setCc(cc);
            req.setHtmlBody(htmlBody);
            return req;
        }
    }
}