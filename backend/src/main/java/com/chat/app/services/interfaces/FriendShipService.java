package com.chat.app.services.interfaces;

import com.chat.app.DTO.FriendResponse;
import com.chat.app.entity.FriendShips;

import java.util.List;

public interface FriendShipService {
    public List<FriendResponse> getFriends(String currentUserId, String Status);
    public void sendFriendRequest(String currentUserId, String friendId);
    public List<FriendResponse>  getPendingRequests(String currentUserId);
    public void acceptFriendRequest(String currentUserId , String requestId);
    public void rejectFriendRequest(String currentUserId , String requestId);
    public void removeFriend(String currentUserId , String friendId);
}
