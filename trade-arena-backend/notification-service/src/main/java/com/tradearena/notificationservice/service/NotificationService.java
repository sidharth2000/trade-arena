package com.tradearena.notificationservice.service;

import com.tradearena.notificationservice.dto.NotificationRequest;
import com.tradearena.notificationservice.dto.NotificationResponse;
import com.tradearena.notificationservice.model.Notification;
import com.tradearena.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final EmailService emailService;

    /**
     * userId -> SSE emitter
     * Thread-safe since requests can come concurrently.
     */
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(0L); // 0 = no timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        // Send a small initial event so frontend knows it's connected
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("userId", userId, "status", "CONNECTED")));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    @Transactional
    public NotificationResponse send(NotificationRequest request) {
        // 1) Persist in DB — now correctly passing referenceId and using enum type
        Notification saved = repository.save(new Notification(
                request.getUserId(),
                request.getMessage(),
                request.getType(),        // NotificationType enum (not raw String)
                request.getReferenceId()  // Bug #2 fix: referenceId now persisted
        ));

        NotificationResponse response = toResponse(saved);

        // 2) Push to SSE if user is connected
        pushToSse(saved.getUserId(), response);

        // 3) Send email if requested and eligible type
        if (request.isSendEmail() && emailService.isEmailType(request.getType())) {
            emailService.sendEmail(request);
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
        Notification saved = repository.save(n);
        return toResponse(saved);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return repository.markAllAsRead(userId);
    }

    private void pushToSse(Long userId, NotificationResponse payload) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) return;

        try {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(payload));
        } catch (IOException e) {
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
}
