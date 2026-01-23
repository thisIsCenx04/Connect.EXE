package com.connectexe.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.user.domain.enums.VerificationStatus;

import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycReviewRequest {
    @NotNull
    private VerificationStatus status;

    private String reviewNote;
}