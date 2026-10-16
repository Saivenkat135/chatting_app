package com.chat.app.config;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class OauthConfig {

    private final GoogleIdTokenVerifier verifier;

    public OauthConfig(
            @Value("${google.client-id}") String clientId) {

        this.verifier =
                new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                )
                        .setAudience(
                                Collections.singletonList(clientId)
                        )
                        .build();
    }

    public GoogleIdToken.Payload verify(
            String idToken)
            throws GeneralSecurityException, IOException {

        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Google ID token is required"
            );
        }

        GoogleIdToken googleToken = verifier.verify(idToken);

        if (googleToken == null) {
            throw new IllegalArgumentException(
                    "Invalid or expired Google ID token"
            );
        }

        return googleToken.getPayload();
    }
}