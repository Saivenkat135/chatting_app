package com.chat.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Messages {

    @Id
    private String id;

    private String conversationId;

    private String senderId;

    private String receiverId;

    private String content;

    private LocalDateTime timestamp;

    private boolean read;
}