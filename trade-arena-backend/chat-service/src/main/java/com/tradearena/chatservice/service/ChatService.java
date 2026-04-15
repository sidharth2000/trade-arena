package com.tradearena.chatservice.service;

import com.tradearena.chatservice.dto.ConversationResponse;
import com.tradearena.chatservice.dto.MessageResponse;
import com.tradearena.chatservice.dto.SendMessageRequest;
import com.tradearena.chatservice.entity.Conversation;
import com.tradearena.chatservice.entity.Message;
import com.tradearena.chatservice.entity.MessageStatus;
import com.tradearena.chatservice.exception.ConversationNotFoundException;
import com.tradearena.chatservice.repository.ConversationRepository;
import com.tradearena.chatservice.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final MessageRepository      messageRepo;

    public ChatService(ConversationRepository conversationRepo,
                       MessageRepository messageRepo) {
        this.conversationRepo = conversationRepo;
        this.messageRepo      = messageRepo;
    }

    // ── GET history between two users ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MessageResponse> getHistory(String userA, String userB) {
        Conversation conv = conversationRepo
                .findByParticipants(userA, userB)
                .orElseThrow(() -> new ConversationNotFoundException(userA, userB));

        return messageRepo
                .findByConversationIdOrderBySentAtAsc(conv.getId())
                .stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    // ── GET all conversations for a user ─────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(String userId) {
        return conversationRepo
                .findAllByUserId(userId)
                .stream()
                .map(this::toConversationResponse)
                .collect(Collectors.toList());
    }

    // ── POST / send message ───────────────────────────────────────────────────

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest req) {
        // Step 1: find existing conversation or create one (one entry forever)
        Conversation conv = conversationRepo
                .findByParticipants(req.getSenderId(), req.getReceiverId())
                .orElseGet(() -> createConversation(req.getSenderId(), req.getReceiverId()));

        // Step 2: persist the message
        Message msg = Message.builder()
                .conversation(conv)
                .senderId(req.getSenderId())
                .content(req.getContent())
                .status(MessageStatus.DELIVERED)
                .sentAt(LocalDateTime.now())
                .build();
        messageRepo.save(msg);

        // Step 3: update last_message snapshot on conversation
        conv.setLastMessage(req.getContent());
        conv.setLastMessageAt(msg.getSentAt());
        conversationRepo.save(conv);

        return toMessageResponse(msg);
    }

    // ── POST mark messages as read ────────────────────────────────────────────

    @Transactional
    public void markAsRead(UUID conversationId, String readerId) {
        // Verify conversation exists
        if (!conversationRepo.existsById(conversationId)) {
            throw new ConversationNotFoundException(conversationId);
        }
        messageRepo.markAllAsRead(conversationId, readerId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Conversation createConversation(String userA, String userB) {
        Conversation conv = Conversation.builder()
                .userOneId(userA)
                .userTwoId(userB)
                .createdAt(LocalDateTime.now())
                .build();
        return conversationRepo.save(conv);
    }

    public MessageResponse toMessageResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSenderId())
                .content(m.getContent())
                .status(m.getStatus())
                .sentAt(m.getSentAt())
                .build();
    }

    private ConversationResponse toConversationResponse(Conversation c) {
        return ConversationResponse.builder()
                .id(c.getId())
                .userOneId(c.getUserOneId())
                .userTwoId(c.getUserTwoId())
                .createdAt(c.getCreatedAt())
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .build();
    }
}