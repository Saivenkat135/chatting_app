package com.chat.app.controller;

import com.chat.app.DTO.SendMessageRequest;
import com.chat.app.entity.Conversations;
import com.chat.app.entity.Messages;
import com.chat.app.services.interfaces.ChatService;
import com.chat.app.services.interfaces.MessagesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;
    private final MessagesService messagesService;

    public ChatController(
            ChatService chatService,
            MessagesService messagesService) {
        this.chatService = chatService;
        this.messagesService = messagesService;
    }

    // =========================================================
    // GET MY CONVERSATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Conversations>> getMyConversations(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                chatService.getMyConversations(email)
        );
    }


    // =========================================================
    // CREATE / GET ONE-TO-ONE CONVERSATION
    // =========================================================

    @PostMapping("/{userid}")
    public ResponseEntity<Conversations> createConversation(
            Authentication authentication,
            @PathVariable String userid) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                chatService.createOrGetConversation(
                        email,
                        userid
                )
        );
    }


    // =========================================================
    // GET CHAT HISTORY
    // =========================================================

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<Messages>> getChatHistory(
            Authentication authentication,
            @PathVariable("chatId") String conversationId) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                chatService.getChatHistory(email, conversationId)
        );
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Messages> sendMessage(
            Authentication authentication,
            @PathVariable String conversationId,
            @RequestBody SendMessageRequest request) {

        request.setConversationId(conversationId);

        return ResponseEntity.ok(
                messagesService.sendPrivateMessage(
                        request,
                        authentication.getName()
                )
        );
    }
}