package com.tradearena.notificationservice.dto;

import com.tradearena.notificationservice.model.Notification;
import com.tradearena.notificationservice.model.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long notificationId;
    private Long userId;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime timestamp;
    private Long referenceId;


    public NotificationResponse() {}

    public NotificationResponse(Long notificationId, Long userId, String message,
                                 NotificationType type, Boolean isRead,
                                 LocalDateTime timestamp, Long referenceId) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.timestamp = timestamp;
        this.referenceId = referenceId;
    }

    public static NotificationResponse fromEntity(Notification n) {
        return new NotificationResponse(
                n.getNotificationId(),
                n.getUserId(),
                n.getMessage(),
                n.getType(),
                n.getIsRead(),
                n.getTimestamp(),
                n.getReferenceId()
        );
    }


    public Long getNotificationId()                         { return notificationId; }
    public void setNotificationId(Long notificationId)      { this.notificationId = notificationId; }

    public Long getUserId()                                 { return userId; }
    public void setUserId(Long userId)                      { this.userId = userId; }

    public String getMessage()                              { return message; }
    public void setMessage(String message)                  { this.message = message; }

    public NotificationType getType()                       { return type; }
    public void setType(NotificationType type)              { this.type = type; }

    public Boolean getIsRead()                              { return isRead; }
    public void setIsRead(Boolean isRead)                   { this.isRead = isRead; }

    public LocalDateTime getTimestamp()                     { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp)       { this.timestamp = timestamp; }

    public Long getReferenceId()                            { return referenceId; }
    public void setReferenceId(Long referenceId)            { this.referenceId = referenceId; }


    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long notificationId;
        private Long userId;
        private String message;
        private NotificationType type;
        private Boolean isRead;
        private LocalDateTime timestamp;
        private Long referenceId;

        public Builder notificationId(Long notificationId) { this.notificationId = notificationId; return this; }
        public Builder userId(Long userId)                  { this.userId = userId; return this; }
        public Builder message(String message)              { this.message = message; return this; }
        public Builder type(NotificationType type)          { this.type = type; return this; }
        public Builder isRead(Boolean isRead)               { this.isRead = isRead; return this; }
        public Builder timestamp(LocalDateTime timestamp)   { this.timestamp = timestamp; return this; }
        public Builder referenceId(Long referenceId)        { this.referenceId = referenceId; return this; }

        public NotificationResponse build() {
            return new NotificationResponse(notificationId, userId, message,
                    type, isRead, timestamp, referenceId);
        }
    }
}
