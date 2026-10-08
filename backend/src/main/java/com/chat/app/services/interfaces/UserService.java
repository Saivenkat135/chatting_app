package com.chat.app.services.interfaces;

import com.chat.app.DTO.LoginRequest;
import com.chat.app.DTO.UpdateProfileRequest;
import com.chat.app.DTO.userLoginResponse;
import com.chat.app.DTO.userRegResponse;
import com.chat.app.entity.UserDetails;

import java.util.List;

public interface UserService {
    userRegResponse saveDetails(UserDetails user);
    userLoginResponse login(LoginRequest request);
    List<UserDetails> getAllUserDetails();
    UserDetails findByUsername(String username);
    UserDetails findByEmail(String username);
    void UpdateUserDetails(String email, UpdateProfileRequest request);
    List<UserDetails> findByUsernameContainingIgnoreCase(String username);
}
