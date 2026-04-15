package com.tradearena.chatservice.dto;

import com.tradearena.chatservice.entity.MessageStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

// ── Request: Send a message ──────────────────────────────────────────────────
// Contains both IDs (used to look up / create the conversation)
// and the message content.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotBlank(message = "senderId is required")
    private String senderId;

    @NotBlank(message = "receiverId is required")
    private String receiverId;

    @NotBlank(message = "content cannot be blank")
    private String content;
}