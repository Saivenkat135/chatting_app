package com.chat.app.controller;

import com.chat.app.entity.UserDetails;
import com.chat.app.repository.UserRepository;
import com.chat.app.services.interfaces.ConversationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/chats")
public class ConversationsController {

    @Autowired
    private ConversationsService conversationsService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllChats(Authentication authentication){
        String email=authentication.getName();

        UserDetails user= userRepository.findByEmail(email)
                .orElseThrow(
                        ()-> new RuntimeException("User not found")
                );

        return conversationsService.getAllChats(user.getUserId());


    }
}
