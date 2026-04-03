package com.tradearena.notificationservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_user_id", columnList = "user_id"),
                @Index(name = "idx_notifications_timestamp", columnList = "timestamp")
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 2000)
    private String message;

    /**
     * Stored as the enum name string (e.g. "OUTBID", "AUCTION_WIN").
     * Using @Enumerated(EnumType.STRING) so DB values are human-readable
     * and safe if enum ordinals ever change.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 80)
    private NotificationType type;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    /**
     * Optional ID of the related entity (product, auction, order).
     * Persisted so the frontend can deep-link to the relevant page.
     * Populated from NotificationRequest.referenceId.
     */
    @Column(name = "reference_id")
    private Long referenceId;

    public Notification() {
        // JPA
    }

    public Notification(Long userId, String message, NotificationType type) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.isRead = false;
        this.timestamp = LocalDateTime.now();
    }

    public Notification(Long userId, String message, NotificationType type, Long referenceId) {
        this(userId, message, type);
        this.referenceId = referenceId;
    }

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    // Getters
    public Long getNotificationId()     { return notificationId; }
    public Long getUserId()             { return userId; }
    public String getMessage()          { return message; }
    public NotificationType getType()   { return type; }
    public Boolean getIsRead()          { return isRead; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Long getReferenceId()        { return referenceId; }

    // Setters
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    public void setUserId(Long userId)                 { this.userId = userId; }
    public void setMessage(String message)             { this.message = message; }
    public void setType(NotificationType type)         { this.type = type; }
    public void setIsRead(Boolean read)                { isRead = read; }
    public void setTimestamp(LocalDateTime timestamp)  { this.timestamp = timestamp; }
    public void setReferenceId(Long referenceId)       { this.referenceId = referenceId; }
}
