package com.connectexe.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.admin.domain.enums.VerificationStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminKycReviewRequest {
    @NotNull(message = "Status is required")
    private VerificationStatus status;
    private String reviewNote;
}
