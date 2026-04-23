package com.tradearena.notificationservice.service;

import com.tradearena.notificationservice.dto.NotificationRequest;
import com.tradearena.notificationservice.dto.NotificationResponse;
import com.tradearena.notificationservice.model.Notification;
import com.tradearena.notificationservice.model.NotificationType;
import com.tradearena.notificationservice.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repository;
    private final EmailService emailService;

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    public SseEmitter subscribe(Long userId) {
        // Remove any existing emitter for this user
        SseEmitter existing = emitters.remove(userId);
        if (existing != null) {
            try { existing.complete(); } catch (Exception ignored) {}
        }

        SseEmitter emitter = new SseEmitter(0L); // 0 = no timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE completed for userId={}", userId);
            emitters.remove(userId);
        });
        emitter.onTimeout(() -> {
            log.debug("SSE timeout for userId={}", userId);
            emitters.remove(userId);
        });
        emitter.onError(e -> {
            log.debug("SSE error for userId={}: {}", userId, e.getMessage());
            emitters.remove(userId);
        });

        // Send initial connected event
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("userId", userId, "status", "CONNECTED")));
            log.debug("SSE subscribed for userId={}", userId);
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    @Transactional
    public NotificationResponse send(NotificationRequest request) {
        Notification saved = repository.save(new Notification(
                request.getUserId(),
                request.getMessage(),
                request.getType(),
                request.getReferenceId()
        ));

        NotificationResponse response = toResponse(saved);

        pushToSse(saved.getUserId(), response);

        if (request.isSendEmail() && emailService.isEmailType(request.getType())) {
            if (request.getHtmlBody() != null && !request.getHtmlBody().isBlank()) {
                String subject = buildSubject(request.getType(), request.getProductTitle());
                emailService.sendHtmlEmail(
                        request.getTo(),
                        request.getCc(),
                        subject,
                        request.getHtmlBody()
                );
            } else {
                emailService.sendEmail(request);
            }
        }
        return response;
    }

    public List<NotificationResponse> getForUser(Long userId) {
        return repository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification n = repository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        n.setIsRead(true);
        return toResponse(repository.save(n));
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return repository.markAllAsRead(userId);
    }

    private void pushToSse(Long userId, NotificationResponse payload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            log.debug("No SSE emitter found for userId={}, skipping push", userId);
            return;
        }

        try {
            // Send as named event "notification" — frontend uses addEventListener("notification")
            // Also send as default event so onmessage also fires as fallback
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(payload));
            log.debug("SSE push sent to userId={}", userId);
        } catch (IOException e) {
            log.debug("SSE push failed for userId={}, removing emitter", userId);
            emitters.remove(userId);
        }
    }

    private NotificationResponse toResponse(Notification n) {
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

    private String buildSubject(NotificationType type, String productTitle) {
        String title = productTitle != null ? " - " + productTitle : "";
        return switch (type) {
            case OUTBID             -> "Trade Arena: You've been outbid" + title;
            case AUCTION_WIN        -> "Trade Arena: You won the auction" + title;
            case PAYMENT_REMINDER   -> "Trade Arena: Payment reminder" + title;
            case AUCTION_ENDED      -> "Trade Arena: Auction ended" + title;
            case PAYMENT_SUCCESS    -> "Trade Arena: Payment confirmed" + title;
            case ACCOUNT_RESTRICTED -> "Trade Arena: Account restricted";
            case FALLBACK_OFFER     -> "Trade Arena: Item available for you" + title;
            default                 -> "Trade Arena: New notification" + title;
        };
    }
}