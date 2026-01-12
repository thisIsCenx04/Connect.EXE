package com.connectexe.auth.dto;

import java.util.UUID;

public class RegisterResponse {
    private UUID userId;
    private String email;

    public RegisterResponse(UUID userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
