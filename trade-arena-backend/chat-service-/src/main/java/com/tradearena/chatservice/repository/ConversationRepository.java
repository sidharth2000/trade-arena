package com.tradearena.chatservice.repository;

import com.tradearena.chatservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    /**
     * Find conversation between two users regardless of storage order.
     * The UNIQUE constraint is (user_one_id, user_two_id) so we check both orderings.
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE (c.userOneId = :a AND c.userTwoId = :b)
               OR (c.userOneId = :b AND c.userTwoId = :a)
            """)
    Optional<Conversation> findByParticipants(@Param("a") String userA,
                                              @Param("b") String userB);

    /**
     * All conversations for a user, most recent message first.
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE c.userOneId = :userId OR c.userTwoId = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    List<Conversation> findAllByUserId(@Param("userId") String userId);
}