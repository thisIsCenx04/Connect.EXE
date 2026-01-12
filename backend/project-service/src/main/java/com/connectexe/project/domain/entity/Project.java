package com.connectexe.project.domain.entity;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 220, unique = true)
    private String slug;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStage stage;

    @Column(nullable = false, length = 120)
    private String industry;

    @Column(length = 2)
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealType dealType;

    @Column(name = "funding_need_usd", precision = 14, scale = 2)
    private BigDecimal fundingNeedUsd;

    @Column(name = "equity_percent", precision = 5, scale = 2)
    private BigDecimal equityPercent;

    @Column(name = "traction_summary")
    private String tractionSummary;

    @Column(name = "pitch_deck_url")
    private String pitchDeckUrl;

    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;

    @Column(name = "featured_rank")
    private Integer featuredRank;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public DealType getDealType() {
        return dealType;
    }

    public void setDealType(DealType dealType) {
        this.dealType = dealType;
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

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public Integer getFeaturedRank() {
        return featuredRank;
    }

    public void setFeaturedRank(Integer featuredRank) {
        this.featuredRank = featuredRank;
    }

    public OffsetDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(OffsetDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public OffsetDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(OffsetDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
