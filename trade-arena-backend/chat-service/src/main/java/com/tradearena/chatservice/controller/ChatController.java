package com.tradearena.chatservice.controller;

import com.tradearena.chatservice.dto.ConversationResponse;
import com.tradearena.chatservice.dto.MessageResponse;
import com.tradearena.chatservice.dto.SendMessageRequest;
import com.tradearena.chatservice.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService            chatService;
    private final SimpMessagingTemplate  messagingTemplate;

    public ChatController(ChatService chatService,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService       = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * GET /api/chat/history/{userA}/{userB}
     * Load full message history between two users (oldest → newest).
     * Called once when the chat window opens; client then upgrades to WS.
     */
    @GetMapping("/history/{userA}/{userB}")
    public ResponseEntity<List<MessageResponse>> getHistory(
            @PathVariable String userA,
            @PathVariable String userB) {

        return ResponseEntity.ok(chatService.getHistory(userA, userB));
    }

    /**
     * GET /api/chat/conversations/{userId}
     * All conversations for a user, most recent first.
     */
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @PathVariable String userId) {

        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    /**
     * POST /api/chat/messages
     * Send a message via REST (also broadcasts over WebSocket so receiver gets it live).
     * Body: { senderId, receiverId, content }
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest req) {

        MessageResponse saved = chatService.sendMessage(req);

        // Broadcast to both participants who are subscribed over WS
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + saved.getConversationId(),
                saved
        );

        return ResponseEntity.ok(saved);
    }

    /**
     * POST /api/chat/conversations/{conversationId}/read?readerId={userId}
     * Marks all unread messages in a conversation as READ for the given user.
     */
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID   conversationId,
            @RequestParam String readerId) {

        chatService.markAsRead(conversationId, readerId);
        return ResponseEntity.noContent().build();
    }
}