package com.chat.app.services.interfaces;

import com.chat.app.entity.Conversations;
import com.chat.app.entity.Messages;

import java.util.List;

public interface ChatService {

    List<Conversations> getMyConversations(String email);

    Conversations createOrGetConversation(
            String email,
            String otherUserId
    );

    List<Messages> getChatHistory(
            String email,
            String chatId
    );
}