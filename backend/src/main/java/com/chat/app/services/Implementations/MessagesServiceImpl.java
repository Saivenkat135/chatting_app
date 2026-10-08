package com.chat.app.services.Implementations;

import com.chat.app.entity.Messages;
import com.chat.app.repository.MessagesRepository;
import com.chat.app.services.interfaces.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MessagesServiceImpl implements MessagesService {

    @Autowired
    private MessagesRepository chatRepository;

    @Override
    public Messages saveChat(Messages chat) {
        return chatRepository.save(chat);
    }
}