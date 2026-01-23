package com.connectexe.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.user.domain.enums.KycDocType;
import com.connectexe.user.domain.enums.UserRole;
import com.connectexe.user.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycResponse {
    private UUID id;
    private UUID userId;
    private VerificationStatus status;
    private String legalName;
    private String organization;
    private String website;
    private String linkedinUrl;
    private KycDocType docType;
    private String docNumber;
    private String docFileUrl;
    private UserRole requestedRole;
    private OffsetDateTime submittedAt;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private String reviewNote;
}
