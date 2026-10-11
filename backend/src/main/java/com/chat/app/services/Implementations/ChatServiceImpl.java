package com.chat.app.services.Implementations;

import com.chat.app.entity.Conversations;
import com.chat.app.entity.Messages;
import com.chat.app.entity.UserDetails;
import com.chat.app.exceptions.AccessDeniedException;
import com.chat.app.exceptions.NoChatHistoryException;
import com.chat.app.repository.ConversationsRepository;
import com.chat.app.repository.MessagesRepository;
import com.chat.app.repository.UserRepository;
import com.chat.app.services.interfaces.ChatService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private final ConversationsRepository conversationRepository;
    private final MessagesRepository messageRepository;
    private final UserRepository userRepository;

    public ChatServiceImpl(
            ConversationsRepository conversationRepository,
            MessagesRepository messageRepository,
            UserRepository userRepository) {

        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // GET MY CONVERSATIONS
    // =========================================================

    @Override
    public List<Conversations> getMyConversations(String email) {

        // 1. Find logged-in user using email from JWT

        UserDetails currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // 2. Get current user's MongoDB ID

        String currentUserId = currentUser.getUserId();


        // 3. Find all conversations containing this user

        return conversationRepository
                .findByParticipantsContaining(currentUserId);
    }


    // =========================================================
    // CREATE OR GET CONVERSATION
    // =========================================================

    @Override
    public Conversations createOrGetConversation(
            String email,
            String otherUserId) {

        // 1. Find logged-in user

        UserDetails currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // 2. Get current user's ID

        String currentUserId = currentUser.getUserId();


        // 3. Don't allow chat with yourself

        if (currentUserId.equals(otherUserId)) {

            throw new RuntimeException(
                    "You cannot create a conversation with yourself"
            );
        }


        // 4. Verify target user exists

        UserDetails otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() ->
                        new RuntimeException("Other user not found")
                );


        // 5. Check if conversation already exists

        List<String> participants = List.of(
                currentUserId,
                otherUser.getUserId()
        );

        var existingConversation =
                conversationRepository
                        .findByTypeAndParticipantsContainingAll(
                                "ONE_TO_ONE",
                                participants
                        );


        // 6. If conversation already exists, return it

        if (existingConversation.isPresent()) {

            return existingConversation.get();
        }


        // 7. Otherwise create a new conversation

        Conversations conversation = new Conversations();

        conversation.setType("ONE_TO_ONE");

        conversation.setParticipants(participants);

        conversation.setLastMessage(null);

        conversation.setLastMessageAt(null);


        // 8. Save conversation

        return conversationRepository.save(conversation);
    }


    // =========================================================
    // GET CHAT HISTORY
    // =========================================================
    @Override
    public List<Messages> getChatHistory(String email, String chatId) {

        // 1. Find current user
        UserDetails currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String currentUserId = currentUser.getUserId();

        // 2. Find conversation
        Conversations conversation = conversationRepository.findById(chatId)
                .orElseThrow(() ->
                        new NoChatHistoryException("No chat history found"));

        // 3. Check whether the user belongs to this conversation
        if (!conversation.getParticipants().contains(currentUserId)) {
            throw new AccessDeniedException(
                    "You are not a participant of this conversation");
        }

        // 4. Fetch messages
        List<Messages> messages =
                messageRepository.findByConversationIdOrderByTimestampAsc(chatId);

        // 5. Return an empty list if no messages exist
        if (messages.isEmpty()) {
            throw new NoChatHistoryException("No chat history found");
        }

        return messages;
    }
}