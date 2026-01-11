package com.connectexe.auth.dto;

import com.connectexe.auth.domain.enums.KycDocType;
import com.connectexe.auth.domain.enums.VerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

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
    private OffsetDateTime submittedAt;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private String reviewNote;

    public KycResponse(UUID id,
                       UUID userId,
                       VerificationStatus status,
                       String legalName,
                       String organization,
                       String website,
                       String linkedinUrl,
                       KycDocType docType,
                       String docNumber,
                       String docFileUrl,
                       OffsetDateTime submittedAt,
                       UUID reviewedBy,
                       OffsetDateTime reviewedAt,
                       String reviewNote) {
        this.id = id;
        this.userId = userId;
        this.status = status;
        this.legalName = legalName;
        this.organization = organization;
        this.website = website;
        this.linkedinUrl = linkedinUrl;
        this.docType = docType;
        this.docNumber = docNumber;
        this.docFileUrl = docFileUrl;
        this.submittedAt = submittedAt;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = reviewedAt;
        this.reviewNote = reviewNote;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getOrganization() {
        return organization;
    }

    public String getWebsite() {
        return website;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public KycDocType getDocType() {
        return docType;
    }

    public String getDocNumber() {
        return docNumber;
    }

    public String getDocFileUrl() {
        return docFileUrl;
    }

    public OffsetDateTime getSubmittedAt() {
        return submittedAt;
    }

    public UUID getReviewedBy() {
        return reviewedBy;
    }

    public OffsetDateTime getReviewedAt() {
        return reviewedAt;
    }

    public String getReviewNote() {
        return reviewNote;
    }
}
