package com.chat.app.services.Implementations;

import com.chat.app.DTO.FriendResponse;
import com.chat.app.entity.FriendShips;
import com.chat.app.repository.FriendShipRepository;
import com.chat.app.repository.UserRepository;
import com.chat.app.services.interfaces.FriendShipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FriendShipServiceImpl implements FriendShipService {

    @Autowired
    private FriendShipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;


    // =========================================================
    // GET FRIENDS
    // =========================================================

    public List<FriendResponse> getFriends(
            String currentUserId,
            String status) {

        List<FriendShips> friendships = new ArrayList<>();

        friendships.addAll(
                friendshipRepository
                        .findByUser1IdAndStatus(currentUserId, status)
        );

        friendships.addAll(
                friendshipRepository
                        .findByUser2IdAndStatus(currentUserId, status)
        );

        List<FriendResponse> friends = new ArrayList<>();

        for (FriendShips friendship : friendships) {

            String friendId;

            if (friendship.getUser1Id().equals(currentUserId)) {
                friendId = friendship.getUser2Id();
            } else {
                friendId = friendship.getUser1Id();
            }

            userRepository.findById(friendId)
                    .ifPresent(user ->
                            friends.add(
                                    new FriendResponse(
                                            friendship.getId(),
                                            user.getUserId(),
                                            user.getUsername()
                                    )
                            )
                    );
        }

        return friends;
    }

    // =========================================================
    // SEND FRIEND REQUEST
    // =========================================================

    public void sendFriendRequest(
            String currentUserId,
            String friendId) {

        // Cannot send request to yourself
        if (currentUserId.equals(friendId)) {
            throw new RuntimeException(
                    "You cannot send a friend request to yourself"
            );
        }

        // Check whether target user exists
        userRepository.findById(friendId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Friend user not found for ID: " + friendId
                        )
                );

        // Check existing friendship
        List<FriendShips> existing1 =
                friendshipRepository
                        .findByUser1IdAndStatus(
                                currentUserId,
                                "PENDING"
                        );

        List<FriendShips> existing2 =
                friendshipRepository
                        .findByUser2IdAndStatus(
                                currentUserId,
                                "PENDING"
                        );

        for (FriendShips friendship : existing1) {

            if (friendship.getUser2Id().equals(friendId)) {
                throw new RuntimeException(
                        "Friend request already exists"
                );
            }
        }

        for (FriendShips friendship : existing2) {

            if (friendship.getUser1Id().equals(friendId)) {
                throw new RuntimeException(
                        "Friend request already exists"
                );
            }
        }

        FriendShips friendship = new FriendShips();

        friendship.setUser1Id(currentUserId);
        friendship.setUser2Id(friendId);
        friendship.setStatus("PENDING");

        friendshipRepository.save(friendship);
    }


    // =========================================================
    // GET PENDING REQUESTS
    // =========================================================

    public List<FriendResponse> getPendingRequests(
            String currentUserId) {

        List<FriendShips> requests =
                friendshipRepository
                        .findByUser2IdAndStatus(
                                currentUserId,
                                "PENDING"
                        );

        List<FriendResponse> responses = new ArrayList<>();

        for (FriendShips request : requests) {

            String senderId = request.getUser1Id();

            userRepository.findById(senderId)
                    .ifPresent(user ->
                            responses.add(
                                    new FriendResponse(
                                            request.getId(),
                                            user.getUserId(),
                                            user.getUsername()
                                    )
                            )
                    );
        }

        return responses;
    }


    // =========================================================
    // ACCEPT REQUEST
    // =========================================================

    public void acceptFriendRequest(
            String currentUserId,
            String requestId) {

        FriendShips friendship =
                friendshipRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Friend request not found"
                                )
                        );

        // Only the receiver can accept
        if (!friendship.getUser2Id().equals(currentUserId)) {
            throw new RuntimeException(
                    "You are not allowed to accept this request"
            );
        }

        // Request must be pending
        if (!friendship.getStatus().equals("PENDING")) {
            throw new RuntimeException(
                    "Friend request is not pending"
            );
        }

        friendship.setStatus("ACCEPTED");

        friendshipRepository.save(friendship);
    }


    // =========================================================
    // REJECT REQUEST
    // =========================================================

    public void rejectFriendRequest(
            String currentUserId,
            String requestId) {

        FriendShips friendship =
                friendshipRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Friend request not found"
                                )
                        );

        // Only receiver can reject
        if (!friendship.getUser2Id().equals(currentUserId)) {
            throw new RuntimeException(
                    "You are not allowed to reject this request"
            );
        }

        if (!friendship.getStatus().equals("PENDING")) {
            throw new RuntimeException(
                    "Friend request is not pending"
            );
        }

        friendship.setStatus("REJECTED");

        friendshipRepository.save(friendship);
    }


    // =========================================================
    // REMOVE FRIEND
    // =========================================================

    public void removeFriend(
            String currentUserId,
            String friendId) {

        List<FriendShips> friendships =
                friendshipRepository
                        .findByUser1IdAndStatus(
                                currentUserId,
                                "ACCEPTED"
                        );

        friendships.addAll(
                friendshipRepository
                        .findByUser2IdAndStatus(
                                currentUserId,
                                "ACCEPTED"
                        )
        );

        for (FriendShips friendship : friendships) {

            boolean isFriend =
                    friendship.getUser1Id().equals(friendId)
                            || friendship.getUser2Id().equals(friendId);

            if (isFriend) {

                friendshipRepository.delete(friendship);

                return;
            }
        }

        throw new RuntimeException(
                "Friendship not found"
        );
    }
}