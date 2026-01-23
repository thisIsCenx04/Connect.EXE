package com.connectexe.auth.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

}
