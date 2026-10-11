package com.chat.app.controller;

import com.chat.app.DTO.FriendResponse;
import com.chat.app.entity.UserDetails;
import com.chat.app.repository.UserRepository;
import com.chat.app.entity.Conversations;
import com.chat.app.services.interfaces.ChatService;
import com.chat.app.services.interfaces.FriendShipService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendShipController {

    @Autowired
    private FriendShipService friendShipService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<FriendResponse>> getFriends(Authentication authentication ,@RequestParam String Status){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()-> new RuntimeException("user not found")
        );

        return  ResponseEntity.ok(friendShipService.getFriends(user.getUserId(),Status));
    }

    @PostMapping("/requests/{friendId}")
    public void sendFriendRequest(Authentication authentication,@PathVariable String friendId){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()->new RuntimeException("user email not found")
        );

        friendShipService.sendFriendRequest(user.getUserId(),friendId);
    }

    @GetMapping("/requests")
    public List<FriendResponse> getPendingRequests(Authentication authentication){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()->new RuntimeException("user not found")
        );

        return friendShipService.getPendingRequests(user.getUserId());
    }

    @GetMapping("/requests/sent")
    public List<FriendResponse> getSentRequests(Authentication authentication) {
        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("user not found")
        );

        return friendShipService.getSentRequests(user.getUserId());
    }

    @PutMapping("/requests/{requestId}/accept")
    public Conversations acceptFriendRequest(
            Authentication authentication,
            @PathVariable String requestId) {
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        String friendId =
                friendShipService.acceptFriendRequest(user.getUserId(), requestId);

        return chatService.createOrGetConversation(email, friendId);

    }

    @PutMapping("/requests/{requestId}/reject")
    public void rejectFriendRequest(Authentication authentication , @PathVariable String requestId){
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        friendShipService.rejectFriendRequest(user.getUserId(),requestId);

    }

    @DeleteMapping("/requests/{requestId}")
    public void deleteFriendRequest(
            Authentication authentication,
            @PathVariable String requestId) {
        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("user not found")
        );

        friendShipService.deletePendingRequest(user.getUserId(), requestId);
    }

    @PutMapping("/requests/{friendId}/remove")
    public void removeFriend(Authentication authentication , @PathVariable String friendId){
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        friendShipService.removeFriend(user.getUserId(), friendId);
    }



}
