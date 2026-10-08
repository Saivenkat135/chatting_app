package com.chat.app.DTO;


import com.chat.app.entity.UserDetails;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class userLoginResponse {

    private String accessToken;
    private UserDetails user;
}
