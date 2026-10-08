package com.chat.app.repository;

import com.chat.app.entity.Messages;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessagesRepository extends MongoRepository<Messages, String> {

}
