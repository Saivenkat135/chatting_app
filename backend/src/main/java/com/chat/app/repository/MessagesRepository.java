package com.chat.app.repository;

import com.chat.app.entity.Messages;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessagesRepository
        extends MongoRepository<Messages, String> {

    List<Messages> findByConversationIdOrderByTimestampAsc(
            String conversationId
    );
}