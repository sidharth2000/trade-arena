
package com.tradearena.chatservice.controller;

import com.tradearena.chatservice.dto.ConversationResponse;
import com.tradearena.chatservice.dto.MessageResponse;
import com.tradearena.chatservice.dto.SendMessageRequest;
import com.tradearena.chatservice.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/history/{userA}/{userB}")
    public ResponseEntity<List<MessageResponse>> getHistory(
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @PathVariable String userA,
            @PathVariable String userB) {

        validateParticipantAccess(authenticatedUserId, userA, userB);
        return ResponseEntity.ok(chatService.getHistory(userA, userB));
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @PathVariable String userId) {

        validateSameUser(authenticatedUserId, userId);
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @Valid @RequestBody SendMessageRequest req) {

        validateSameUser(authenticatedUserId, req.getSenderId());

        MessageResponse saved = chatService.sendMessage(req);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + saved.getConversationId(),
                saved
        );

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String authenticatedUserId,
            @PathVariable UUID conversationId,
            @RequestParam String readerId) {

        validateSameUser(authenticatedUserId, readerId);
        chatService.markAsRead(conversationId, readerId);
        return ResponseEntity.noContent().build();
    }

    private void validateSameUser(String authenticatedUserId, String requestedUserId) {
        if (authenticatedUserId == null || authenticatedUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        if (!authenticatedUserId.equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User mismatch");
        }
    }

    private void validateParticipantAccess(String authenticatedUserId, String userA, String userB) {
        if (authenticatedUserId == null || authenticatedUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id header");
        }
        if (!authenticatedUserId.equals(userA) && !authenticatedUserId.equals(userB)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a conversation participant");
        }
    }
}