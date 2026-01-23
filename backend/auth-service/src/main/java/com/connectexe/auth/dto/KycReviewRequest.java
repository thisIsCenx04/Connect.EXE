package com.connectexe.auth.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.auth.domain.enums.VerificationStatus;
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
