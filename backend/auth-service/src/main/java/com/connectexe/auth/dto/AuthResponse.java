package com.connectexe.auth.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.domain.enums.VerificationStatus;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserSummary user;

    public static class UserSummary {
        private UUID id;
        private String email;
        private String fullName;
        private UserRole role;
        private VerificationStatus verifiedStatus;
        private String avatarUrl;
        private boolean emailVerified;

        public UserSummary(UUID id,
                           String email,
                           String fullName,
                           UserRole role,
                           VerificationStatus verifiedStatus,
                           String avatarUrl,
                           boolean emailVerified) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.verifiedStatus = verifiedStatus;
            this.avatarUrl = avatarUrl;
            this.emailVerified = emailVerified;
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

        public VerificationStatus getVerifiedStatus() {
            return verifiedStatus;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public boolean isEmailVerified() {
            return emailVerified;
        }
    }
}
