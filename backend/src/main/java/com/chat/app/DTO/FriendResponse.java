package com.chat.app.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FriendResponse {
    private String requestId;
    private String id;
    private String username;
}