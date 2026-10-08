package com.chat.app.controller;

import com.chat.app.DTO.LoginRequest;
import com.chat.app.DTO.UpdateProfileRequest;
import com.chat.app.DTO.userLoginResponse;
import com.chat.app.DTO.userRegResponse;
import com.chat.app.security.JwtService;
import com.chat.app.entity.UserDetails;
import com.chat.app.services.interfaces.UserService;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    // Return ResponseEntity with HTTP 201 Created and the saved user body
    @PostMapping("/register")
    public userRegResponse saveUser(@RequestBody UserDetails userDetails) {
        System.out.println("Received User Details: " + userDetails.getUsername() + ", " + userDetails.getEmail());
        return userService.saveDetails(userDetails);
    }

    @PostMapping("/login")
    public ResponseEntity<userLoginResponse> login(@RequestBody LoginRequest request) {

        userLoginResponse response= userService.login(request);
        return ResponseEntity.ok(response);

    }

    @GetMapping("/me")
    public UserDetails getCurrentUser(@RequestHeader("authorisation") String authorisation){

        String token=authorisation.substring(7);

        String userEmail= jwtService.extractEmail(token);

        return userService.findByEmail(userEmail);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully")
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDetails>> findAll() {
        return ResponseEntity.ok(userService.getAllUserDetails());
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDetails> findByUsername(@PathVariable String username) {
        UserDetails user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<?> updateProfile(@PathVariable String email,
            @RequestBody UpdateProfileRequest request) {

        userService.UpdateUserDetails(email, request);

        return ResponseEntity.ok(
                Map.of("message",
                        "Profile updated successfully")
        );
    }

    @GetMapping("/search/{username}")
    public ResponseEntity<?> findByUsernameIgnoreCase(@PathVariable String username){
        List<UserDetails> users= userService.findByUsernameContainingIgnoreCase(username);
        return
                ResponseEntity.ok(
                        Map.of("success", true,
                                "message", "Users retrieved successfully",
                                "users", users)
                );
    }
}