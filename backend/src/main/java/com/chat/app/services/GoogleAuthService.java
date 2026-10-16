package com.chat.app.services;

import com.chat.app.DTO.AuthUserResponse;
import com.chat.app.DTO.GoogleLoginResponse;
import com.chat.app.config.OauthConfig;
import com.chat.app.entity.UserDetails;
import com.chat.app.repository.UserRepository;
import com.chat.app.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Locale;
import java.util.UUID;

@Service
public class GoogleAuthService {

    private final OauthConfig googleTokenService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public GoogleAuthService(
            OauthConfig googleTokenService,
            UserRepository userRepository,
            JwtService jwtService) {

        this.googleTokenService = googleTokenService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public GoogleLoginResponse login(
            String idToken)
            throws GeneralSecurityException, IOException {

        // 1. Verify the Google ID token.
        GoogleIdToken.Payload payload =
                googleTokenService.verify(idToken);

        // 2. Read identity claims from the verified token.
        String googleId = payload.getSubject();
        String email = payload.getEmail();

        Boolean emailVerified =
                payload.getEmailVerified();

        String displayName =
                (String) payload.get("name");

        if (googleId == null || googleId.isBlank()
                || email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Google account is missing required information"
            );
        }

        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new IllegalArgumentException(
                    "Your Google email must be verified"
            );
        }

        // 3. Find the account by Google's stable ID.
        UserDetails user = userRepository
                .findByGoogleId(googleId)
                .orElse(null);

        if (user == null) {

            // 4. Do not automatically link an existing
            // password account just because the email matches.
            if (userRepository.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException(
                        "An account with this email already exists. " +
                                "Sign in using your existing method and " +
                                "link Google through account settings."
                );
            }

            // 5. Create a new application user.
            user = createGoogleUser(
                    googleId,
                    email,
                    displayName
            );
        }

        // 6. Generate YOUR application's JWT.
        // Adapt this call to your existing JwtService.
        String accessToken =
                jwtService.generateToken(user.getEmail());

        // 7. Return the same response shape as normal login.
        AuthUserResponse userResponse =
                new AuthUserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getEmail()
                );

        return new GoogleLoginResponse(
                accessToken,
                userResponse
        );
    }

    private UserDetails createGoogleUser(
            String googleId,
            String email,
            String displayName) {

        UserDetails user = new UserDetails();

        user.setGoogleId(googleId);
        user.setEmail(email);

        String username = generateUsername(
                email,
                displayName
        );

        user.setUsername(username);

        // Google users authenticate with Google, not a
        // locally stored password.
        // Your User model and password login must support this.
        user.setPassword(null);

        // Let MongoDB generate the user ID if your existing
        // entity already uses that approach.
        return userRepository.save(user);
    }

    private String generateUsername(
            String email,
            String displayName) {

        String base = displayName;

        if (base == null || base.isBlank()) {
            base = email.substring(0, email.indexOf('@'));
        }

        base = base.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9_]", "");

        if (base.isBlank()) {
            base = "user";
        }

        // Keep the username short and add a suffix to reduce
        // collisions with existing application usernames.
        base = base.substring(0, Math.min(base.length(), 18));

        String candidate = base;

        while (userRepository.existsByUsername(candidate)) {
            candidate = base + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 6);
        }

        return candidate;
    }
}
