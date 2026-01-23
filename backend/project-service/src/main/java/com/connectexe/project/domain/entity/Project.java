package com.connectexe.project.domain.entity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectModerationStatus;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.domain.enums.ProjectVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
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

    @Column
    private String summary;

    @Column
    private String content;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "project_stage")
    private ProjectStage stage;

    @Column(nullable = false, length = 120)
    private String industry;

    @Column(length = 2)
    private String country;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "project_status")
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "moderation_status", nullable = false, columnDefinition = "project_moderation_status")
    private ProjectModerationStatus moderationStatus = ProjectModerationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "project_visibility")
    private ProjectVisibility visibility = ProjectVisibility.PRIVATE;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "deal_type")
    private DealType dealType;

    @Column(name = "funding_target_usd", precision = 14, scale = 2)
    private BigDecimal fundingTargetUsd;

    @Column(name = "funding_need_usd", precision = 14, scale = 2)
    private BigDecimal fundingNeedUsd;

    @Column(name = "funding_raised_usd", precision = 14, scale = 2)
    private BigDecimal fundingRaisedUsd;

    @Column(name = "valuation_usd", precision = 14, scale = 2)
    private BigDecimal valuationUsd;

    @Column(name = "equity_percent", precision = 5, scale = 2)
    private BigDecimal equityPercent;

    @Column(name = "traction_summary")
    private String tractionSummary;

    @Column(name = "funding_timeline")
    private String fundingTimeline;

    @Column(name = "traction_metrics")
    private String tractionMetrics;

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

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime updatedAt;

}
