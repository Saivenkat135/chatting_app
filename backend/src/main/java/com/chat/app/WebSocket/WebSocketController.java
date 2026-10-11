//package com.chat.app.WebSocket;
//
//import com.chat.app.DTO.SendMessageRequest;
//import com.chat.app.entity.Messages;
//import com.chat.app.repository.MessagesRepository;
//import com.chat.app.services.interfaces.MessagesService;
//
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Controller;
//
//import java.security.Principal;
//import java.time.LocalDateTime;
//
//@Controller
//public class WebSocketController {
//
//    private final MessagesRepository messagesRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//
//    public WebSocketController(
//            MessagesRepository messagesRepository,
//            SimpMessagingTemplate messagingTemplate) {
//
//        this.messagesRepository = messagesRepository;
//        this.messagingTemplate = messagingTemplate;
//    }
//
//    @MessageMapping("/chat.send")
//    public void sendMessage(
//            SendMessageRequest request,
//            Principal principal) {
//
//        // The authenticated sender's identity.
//        String senderEmail = principal.getName();
//
//        // Resolve the sender and receiver using your user service.
//        // Validate that the sender belongs to this conversation.
//        // Resolve the receiver's authenticated messaging identity.
//
//        Messages message = new Messages();
//
//        message.setConversationId(request.getConversationId());
//        message.setSenderId("user101"); // Resolve from authenticated user
//        message.setReceiverId(request.getReceiverId());
//        message.setContent(request.getContent());
//        message.setTimestamp(LocalDateTime.now());
//        message.setRead(false);
//
//        Messages savedMessage =
//                messagesRepository.save(message);
//
//        // Send the saved message to the receiver here,
//        // after resolving the receiver's messaging identity.
//
//
//    }
//}