package com.connectexe.project.dto;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectResponse {
    private UUID id;
    private UUID ownerId;
    private String title;
    private String slug;
    private String description;
    private ProjectStage stage;
    private String industry;
    private String country;
    private ProjectStatus status;
    private DealType dealType;
    private BigDecimal fundingNeedUsd;
    private BigDecimal equityPercent;
    private String tractionSummary;
    private String pitchDeckUrl;
    private boolean featured;
    private Integer featuredRank;
    private OffsetDateTime publishedAt;
    private OffsetDateTime closedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public ProjectResponse(UUID id,
                           UUID ownerId,
                           String title,
                           String slug,
                           String description,
                           ProjectStage stage,
                           String industry,
                           String country,
                           ProjectStatus status,
                           DealType dealType,
                           BigDecimal fundingNeedUsd,
                           BigDecimal equityPercent,
                           String tractionSummary,
                           String pitchDeckUrl,
                           boolean featured,
                           Integer featuredRank,
                           OffsetDateTime publishedAt,
                           OffsetDateTime closedAt,
                           OffsetDateTime createdAt,
                           OffsetDateTime updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.stage = stage;
        this.industry = industry;
        this.country = country;
        this.status = status;
        this.dealType = dealType;
        this.fundingNeedUsd = fundingNeedUsd;
        this.equityPercent = equityPercent;
        this.tractionSummary = tractionSummary;
        this.pitchDeckUrl = pitchDeckUrl;
        this.featured = featured;
        this.featuredRank = featuredRank;
        this.publishedAt = publishedAt;
        this.closedAt = closedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public ProjectStage getStage() {
        return stage;
    }

    public String getIndustry() {
        return industry;
    }

    public String getCountry() {
        return country;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public DealType getDealType() {
        return dealType;
    }

    public BigDecimal getFundingNeedUsd() {
        return fundingNeedUsd;
    }

    public BigDecimal getEquityPercent() {
        return equityPercent;
    }

    public String getTractionSummary() {
        return tractionSummary;
    }

    public String getPitchDeckUrl() {
        return pitchDeckUrl;
    }

    public boolean isFeatured() {
        return featured;
    }

    public Integer getFeaturedRank() {
        return featuredRank;
    }

    public OffsetDateTime getPublishedAt() {
        return publishedAt;
    }

    public OffsetDateTime getClosedAt() {
        return closedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
