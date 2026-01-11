package com.connectexe.auth.dto;

import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UserProfileResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private UserRole role;
    private String headline;
    private String bio;
    private String country;
    private String city;
    private VerificationStatus verifiedStatus;
    private OffsetDateTime verifiedAt;
    private boolean emailVerified;
    private OffsetDateTime emailVerifiedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UserProfileResponse(UUID id,
                               String email,
                               String fullName,
                               String avatarUrl,
                               UserRole role,
                               String headline,
                               String bio,
                               String country,
                               String city,
                               VerificationStatus verifiedStatus,
                               OffsetDateTime verifiedAt,
                               boolean emailVerified,
                               OffsetDateTime emailVerifiedAt,
                               OffsetDateTime createdAt,
                               OffsetDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.headline = headline;
        this.bio = bio;
        this.country = country;
        this.city = city;
        this.verifiedStatus = verifiedStatus;
        this.verifiedAt = verifiedAt;
        this.emailVerified = emailVerified;
        this.emailVerifiedAt = emailVerifiedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public UserRole getRole() {
        return role;
    }

    public String getHeadline() {
        return headline;
    }

    public String getBio() {
        return bio;
    }

    public String getCountry() {
        return country;
    }

    public String getCity() {
        return city;
    }

    public VerificationStatus getVerifiedStatus() {
        return verifiedStatus;
    }

    public OffsetDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public OffsetDateTime getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
