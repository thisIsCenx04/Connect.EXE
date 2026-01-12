package com.connectexe.project.dto;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectMemberRole;
import com.connectexe.project.domain.enums.ProjectStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ProjectCreateRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private ProjectStage stage;

    @NotBlank
    @Size(max = 120)
    private String industry;

    @NotNull
    private DealType dealType;

    @Size(max = 2)
    private String country;

    private BigDecimal fundingNeedUsd;

    private BigDecimal equityPercent;

    private String tractionSummary;

    private String pitchDeckUrl;

    private ProjectMemberRole creatorRole;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStage getStage() {
        return stage;
    }

    public void setStage(ProjectStage stage) {
        this.stage = stage;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public DealType getDealType() {
        return dealType;
    }

    public void setDealType(DealType dealType) {
        this.dealType = dealType;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public BigDecimal getFundingNeedUsd() {
        return fundingNeedUsd;
    }

    public void setFundingNeedUsd(BigDecimal fundingNeedUsd) {
        this.fundingNeedUsd = fundingNeedUsd;
    }

    public BigDecimal getEquityPercent() {
        return equityPercent;
    }

    public void setEquityPercent(BigDecimal equityPercent) {
        this.equityPercent = equityPercent;
    }

    public String getTractionSummary() {
        return tractionSummary;
    }

    public void setTractionSummary(String tractionSummary) {
        this.tractionSummary = tractionSummary;
    }

    public String getPitchDeckUrl() {
        return pitchDeckUrl;
    }

    public void setPitchDeckUrl(String pitchDeckUrl) {
        this.pitchDeckUrl = pitchDeckUrl;
    }

    public ProjectMemberRole getCreatorRole() {
        return creatorRole;
    }

    public void setCreatorRole(ProjectMemberRole creatorRole) {
        this.creatorRole = creatorRole;
    }
}
