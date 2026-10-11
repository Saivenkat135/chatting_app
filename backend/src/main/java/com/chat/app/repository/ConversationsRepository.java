package com.chat.app.repository;

import com.chat.app.entity.Conversations;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationsRepository
        extends MongoRepository<Conversations, String> {

    List<Conversations> findByParticipantsContaining(String userId);

    @Query("{ 'type': ?0, 'participants': { '$all': ?1 } }")
    Optional<Conversations> findByTypeAndParticipantsContainingAll(
            String type,
            List<String> participants
    );
}