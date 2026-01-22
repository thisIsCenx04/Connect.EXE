package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.admin.domain.enums.KycDocType;
import com.connectexe.admin.domain.enums.UserRole;
import com.connectexe.admin.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminKycSummary {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private VerificationStatus status;
    private UserRole requestedRole;
    private String legalName;
    private String organization;
    private String website;
    private String linkedinUrl;
    private KycDocType docType;
    private String docNumber;
    private String docFileUrl;
    private OffsetDateTime submittedAt;
    private OffsetDateTime reviewedAt;
    private String reviewNote;
}
