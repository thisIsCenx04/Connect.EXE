package com.connectexe.auth.dto;

import com.connectexe.auth.domain.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public class KycReviewRequest {
    @NotNull
    private VerificationStatus status;

    private String reviewNote;

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }
}
