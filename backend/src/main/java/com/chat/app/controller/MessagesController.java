package com.chat.app.controller;

import com.chat.app.entity.Messages;
import com.chat.app.services.interfaces.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chats")
public class MessagesController {

    @Autowired
    private MessagesService chatService;

    @PostMapping
    public Messages saveChat(@RequestBody Messages chat) {
        return chatService.saveChat(chat);
    }
}