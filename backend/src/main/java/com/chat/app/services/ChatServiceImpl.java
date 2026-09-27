package com.chat.app.services;

import com.chat.app.entity.Chat;
import com.chat.app.repository.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Override
    public Chat saveChat(Chat chat) {
        return chatRepository.save(chat);
    }
}