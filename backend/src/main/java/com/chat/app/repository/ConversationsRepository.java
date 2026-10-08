package com.chat.app.repository;


import com.chat.app.entity.Conversations;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationsRepository extends MongoRepository<Conversations,String> {
}
