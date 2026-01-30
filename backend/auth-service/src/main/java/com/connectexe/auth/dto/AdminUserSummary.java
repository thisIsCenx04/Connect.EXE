package com.connectexe.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummary {
    private UUID id;
    private String email;
    private String fullName;
    private UserRole role;
    private VerificationStatus verifiedStatus;
    private boolean active;
    private boolean emailVerified;
    private OffsetDateTime createdAt;
}
