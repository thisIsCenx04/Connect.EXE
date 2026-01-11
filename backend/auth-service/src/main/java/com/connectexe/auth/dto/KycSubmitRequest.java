package com.connectexe.auth.dto;

import com.connectexe.auth.domain.enums.KycDocType;
import jakarta.validation.constraints.Size;

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

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public KycDocType getDocType() {
        return docType;
    }

    public void setDocType(KycDocType docType) {
        this.docType = docType;
    }

    public String getDocNumber() {
        return docNumber;
    }

    public void setDocNumber(String docNumber) {
        this.docNumber = docNumber;
    }

    public String getDocFileUrl() {
        return docFileUrl;
    }

    public void setDocFileUrl(String docFileUrl) {
        this.docFileUrl = docFileUrl;
    }
}
