package com.tradearena.notificationservice.controller;

import com.tradearena.notificationservice.dto.NotificationRequest;
import com.tradearena.notificationservice.dto.NotificationResponse;
import com.tradearena.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    /**
     * Called by other microservices to trigger notifications.
     *
     * NOTE: By default we permit this endpoint without JWT (simple internal calls).
     * In production, you can secure it using:
     * - service-to-service token
     * - mTLS
     * - gateway-only access
     */
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(service.send(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getForUser(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(service.markAsRead(notificationId));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        int updated = service.markAllAsRead(userId);
        return ResponseEntity.ok(java.util.Map.of("updated", updated));
    }

    /**
     * SSE stream: frontend subscribes here for real-time push notifications.
     * This endpoint is intentionally public (no JWT) in this implementation,
     * because many frontends use EventSource which does NOT easily support Authorization headers.
     *
     * If you want it secured, you can:
     * - pass token as query param (not ideal)
     * - use cookie-based auth
     * - use a custom SSE client (fetch-based streaming) with Authorization header
     */
    @GetMapping("/stream/{userId}")
    public SseEmitter stream(@PathVariable Long userId) {
        return service.subscribe(userId);
    }
}