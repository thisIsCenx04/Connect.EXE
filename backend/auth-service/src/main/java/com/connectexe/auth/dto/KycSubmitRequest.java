package com.connectexe.auth.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.auth.domain.enums.KycDocType;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KycSubmitRequest {
    @Size(max = 255)
    private String legalName;

    @Size(max = 255)
    private String organization;

    private String website;

    private String linkedinUrl;

    private KycDocType docType;

    @Size(max = 100)
    private String docNumber;

    private String docFileUrl;

}
