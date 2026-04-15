package com.tradearena.chatservice.repository;

import com.tradearena.chatservice.entity.Message;
import com.tradearena.chatservice.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Full message history for a conversation, oldest-first.
     */
    List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

    /**
     * All unread messages in a conversation sent by someone other than the reader.
     */
    @Query("""
            SELECT m FROM Message m
            WHERE m.conversation.id = :convId
              AND m.senderId <> :readerId
              AND m.status <> com.tradearena.chatservice.entity.MessageStatus.READ
            """)
    List<Message> findUnread(@Param("convId")   UUID   conversationId,
                             @Param("readerId") String readerId);

    /**
     * Bulk-mark messages as READ in one UPDATE.
     */
    @Modifying
    @Query("""
            UPDATE Message m
               SET m.status = com.tradearena.chatservice.entity.MessageStatus.READ
             WHERE m.conversation.id = :convId
               AND m.senderId <> :readerId
               AND m.status <> com.tradearena.chatservice.entity.MessageStatus.READ
            """)
    void markAllAsRead(@Param("convId")   UUID   conversationId,
                       @Param("readerId") String readerId);
}