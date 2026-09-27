package com.chat.app.controller;

import com.chat.app.entity.Chat;
import com.chat.app.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public Chat saveChat(@RequestBody Chat chat) {
        return chatService.saveChat(chat);
    }
}