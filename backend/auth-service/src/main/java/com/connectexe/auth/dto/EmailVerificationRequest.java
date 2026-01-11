package com.connectexe.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class EmailVerificationRequest {
    @NotBlank
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
