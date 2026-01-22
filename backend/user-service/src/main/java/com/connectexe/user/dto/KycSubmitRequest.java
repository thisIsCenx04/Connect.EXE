package com.connectexe.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.user.domain.enums.KycDocType;
import com.connectexe.user.domain.enums.UserRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycSubmitRequest {
    @NotBlank
    private String legalName;

    private String organization;

    private String website;

    private String linkedinUrl;

    private KycDocType docType;

    private String docNumber;

    private String docFileUrl;

    @NotNull
    private UserRole requestedRole;
}
