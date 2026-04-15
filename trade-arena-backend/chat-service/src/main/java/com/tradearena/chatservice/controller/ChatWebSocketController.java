package com.tradearena.chatservice.controller;

import com.tradearena.chatservice.dto.MessageResponse;
import com.tradearena.chatservice.dto.SendMessageRequest;
import com.tradearena.chatservice.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService           chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.chatService       = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Client sends STOMP message to: /app/chat.send
     * Payload: { senderId, receiverId, content }
     *
     * After saving to DB the message is broadcast to:
     *   /topic/conversation/{conversationId}
     *
     * Both users subscribe to this topic when the chat window is open.
     */
    @MessageMapping("/chat.send")
    public void handleMessage(@Payload SendMessageRequest req) {
        MessageResponse saved = chatService.sendMessage(req);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + saved.getConversationId(),
                saved
        );
    }
}