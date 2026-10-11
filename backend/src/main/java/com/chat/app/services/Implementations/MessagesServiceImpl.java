package com.chat.app.services.Implementations;

import com.chat.app.DTO.SendMessageRequest;
import com.chat.app.entity.Conversations;
import com.chat.app.entity.Messages;
import com.chat.app.entity.UserDetails;
import com.chat.app.repository.ConversationsRepository;
import com.chat.app.repository.MessagesRepository;
import com.chat.app.repository.UserRepository;

import com.chat.app.services.interfaces.MessagesService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessagesServiceImpl implements MessagesService {

    private final MessagesRepository messagesRepository;
    private final ConversationsRepository conversationsRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessagesServiceImpl(
            MessagesRepository messagesRepository,
            ConversationsRepository conversationsRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {

        this.messagesRepository = messagesRepository;
        this.conversationsRepository = conversationsRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public Messages sendPrivateMessage(
            SendMessageRequest request,
            String senderEmail) {

        if (request == null
                || request.getConversationId() == null
                || request.getConversationId().isBlank()
                || request.getReceiverId() == null
                || request.getReceiverId().isBlank()) {
            throw new RuntimeException(
                    "Conversation ID and receiver ID are required"
            );
        }

        // 1. Find the authenticated sender.
        UserDetails sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() ->
                        new RuntimeException("Sender not found"));

        // 2. Find the receiver using their MongoDB user ID.
        UserDetails receiver = userRepository.findById(
                request.getReceiverId()
        ).orElseThrow(() ->
                new RuntimeException("Receiver not found"));

        Conversations conversation = conversationsRepository.findById(
                request.getConversationId()
        ).orElseThrow(() ->
                new RuntimeException("Conversation not found"));

        if (!"ONE_TO_ONE".equals(conversation.getType())
                || conversation.getParticipants() == null
                || conversation.getParticipants().size() != 2
                || !conversation.getParticipants().contains(sender.getUserId())
                || !conversation.getParticipants().contains(receiver.getUserId())) {
            throw new RuntimeException(
                    "Sender and receiver must belong to a one-to-one conversation"
            );
        }

        if (request.getContent() == null
                || request.getContent().isBlank()) {
            throw new RuntimeException("Message cannot be empty");
        }

        // 4. Create the database message.
        Messages message = new Messages();

        message.setConversationId(request.getConversationId());
        message.setSenderId(sender.getUserId());
        message.setReceiverId(receiver.getUserId());
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        // 5. Save to MongoDB first.
        Messages savedMessage =
                messagesRepository.save(message);

        conversation.setLastMessage(savedMessage.getContent());
        conversation.setLastMessageAt(savedMessage.getTimestamp().toString());
        conversationsRepository.save(conversation);

        // 6. Send the SAVED message to the receiver.
        //    Spring targets the receiver's authenticated identity.
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                savedMessage
        );

        // 7. Return the saved message.
        return savedMessage;
    }
}