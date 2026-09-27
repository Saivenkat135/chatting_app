package com.chat.app.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "chat_data")
public class Chat {

    @Id
    private String id;

    private String chatId;

    private String message;
}