package com.tradearena.chatservice.dto;

import com.tradearena.chatservice.entity.MessageStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private UUID            id;
    private UUID            conversationId;
    private String          senderId;
    private String          content;
    private MessageStatus   status;
    private LocalDateTime   sentAt;
}