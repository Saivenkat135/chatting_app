package com.chat.app.controller;

import com.chat.app.DTO.SendMessageRequest;
import com.chat.app.entity.Messages;
import com.chat.app.services.interfaces.MessagesService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class MessagesController {

    private final MessagesService messagesService;

    public MessagesController(MessagesService messagesService) {
        this.messagesService = messagesService;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(
            SendMessageRequest request,
            Principal principal) {

        // JWT-authenticated identity.
        String senderEmail = principal.getName();

        messagesService.sendPrivateMessage(
                request,
                senderEmail
        );
    }
}