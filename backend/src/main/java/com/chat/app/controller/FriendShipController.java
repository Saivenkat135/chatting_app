package com.chat.app.controller;

import com.chat.app.DTO.FriendRequest;
import com.chat.app.DTO.FriendResponse;
import com.chat.app.entity.UserDetails;
import com.chat.app.repository.UserRepository;
import com.chat.app.services.interfaces.FriendShipService;
import org.apache.tomcat.util.http.parser.Authorization;

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

    @GetMapping
    public ResponseEntity<?> getFriends(Authentication authentication ,@RequestParam String Status){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()-> new RuntimeException("user not found")
        );

        return  ResponseEntity.ok(friendShipService.getFriends(user.getUserId(),Status));
    }

    @PostMapping("/requests")
    public void sendFriendRequest(Authentication authentication,@RequestBody FriendRequest request){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()->new RuntimeException("user email not found")
        );

        friendShipService.sendFriendRequest(user.getUserId(),request.getFriendId());
    }

    @GetMapping("/requests")
    public List<FriendResponse> getPendingRequests(Authentication authentication){
        String email=authentication.getName();

        UserDetails user=userRepository.findByEmail(email).orElseThrow(
                ()->new RuntimeException("user not found")
        );

        return friendShipService.getPendingRequests(user.getUserId());
    }

    @PutMapping("/requests/{requestId}/accept")
    public void acceptFriendRequest(Authentication authentication , @PathVariable String requestId){
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        friendShipService.acceptFriendRequest(user.getUserId(),requestId);

    }

    @PutMapping("/requests/{requestId}/reject")
    public void rejectFriendRequest(Authentication authentication , @PathVariable String requestId){
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        friendShipService.rejectFriendRequest(user.getUserId(),requestId);

    }

    @PutMapping("/requests/{friendId}/remove")
    public void removeFriend(Authentication authentication , @PathVariable String friendId){
        String email =  authentication.getName();

        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("user not found"));

        userRepository.findById(friendId)
                .orElseThrow(()->new RuntimeException("user not found"));

        friendShipService.rejectFriendRequest(user.getUserId(),friendId);

    }



}
