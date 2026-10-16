package com.chat.app.controller;

import com.chat.app.config.OauthConfig;
import com.chat.app.DTO.GoogleLoginRequest;
import com.chat.app.DTO.GoogleLoginResponse;

import com.chat.app.services.GoogleAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(
            GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @RequestBody GoogleLoginRequest request) {

        try {
            GoogleLoginResponse response =
                    googleAuthService.login(request.getIdToken());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            ex.getMessage() == null
                                    ? "Google login failed"
                                    : ex.getMessage()
                    ));

        } catch (GeneralSecurityException | IOException ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to verify Google login. Please try again."
                    ));
        }
    }
}
