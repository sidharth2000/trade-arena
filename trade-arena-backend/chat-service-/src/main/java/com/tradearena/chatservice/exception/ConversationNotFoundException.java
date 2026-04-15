package com.tradearena.chatservice.exception;

import java.util.UUID;

public class ConversationNotFoundException extends RuntimeException {
    public ConversationNotFoundException(String userA, String userB) {
        super("No conversation found between users: " + userA + " and " + userB);
    }
    public ConversationNotFoundException(UUID id) {
        super("Conversation not found with id: " + id);
    }
}