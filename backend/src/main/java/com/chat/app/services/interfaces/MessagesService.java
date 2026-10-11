package com.chat.app.services.interfaces;


import com.chat.app.DTO.SendMessageRequest;
import com.chat.app.entity.Messages;

public interface MessagesService {

    Messages sendPrivateMessage(
            SendMessageRequest request,
            String senderEmail
    );
}