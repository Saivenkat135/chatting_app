package com.chat.app.DTO;

import lombok.Data;

@Data
public class SendMessageRequest {
    private String conversationId;
    private String receiverId;
    private String content;
}