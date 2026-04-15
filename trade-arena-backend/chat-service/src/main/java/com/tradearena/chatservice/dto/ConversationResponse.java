package com.tradearena.chatservice.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationResponse {
    private UUID          id;
    private String        userOneId;
    private String        userTwoId;
    private LocalDateTime createdAt;
    private String        lastMessage;
    private LocalDateTime lastMessageAt;
}