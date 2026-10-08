package com.chat.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_data")
public class Messages {

    @Id
    private String id;

    private String conversationId;

    private String senderId;

    private String receiverId;

    @CreatedDate
    private String createdAt;

    private boolean read;
}