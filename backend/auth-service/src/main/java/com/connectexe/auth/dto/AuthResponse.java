package com.connectexe.auth.dto;

import com.connectexe.auth.domain.enums.UserRole;

import java.util.UUID;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserSummary user;

    public AuthResponse(String accessToken, String refreshToken, UserSummary user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public UserSummary getUser() {
        return user;
    }

    public static class UserSummary {
        private UUID id;
        private String email;
        private String fullName;
        private UserRole role;

        public UserSummary(UUID id, String email, String fullName, UserRole role) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }

        public UUID getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getFullName() {
            return fullName;
        }

        public UserRole getRole() {
            return role;
        }
    }
}
