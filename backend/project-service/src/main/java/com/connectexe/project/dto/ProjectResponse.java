package com.connectexe.project.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectModerationStatus;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.domain.enums.ProjectVisibility;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private UUID ownerId;
    private String title;
    private String slug;
    private String description;
    private String summary;
    private String content;
    private ProjectStage stage;
    private String industry;
    private String country;
    private ProjectStatus status;
    private ProjectModerationStatus moderationStatus;
    private ProjectVisibility visibility;
    private DealType dealType;
    private BigDecimal fundingTargetUsd;
    private BigDecimal fundingNeedUsd;
    private BigDecimal fundingRaisedUsd;
    private BigDecimal valuationUsd;
    private BigDecimal equityPercent;
    private String tractionSummary;
    private String fundingTimeline;
    private String tractionMetrics;
    private String pitchDeckUrl;
    private boolean featured;
    private Integer featuredRank;
    private List<String> tags;
    private List<ProjectLinkResponse> links;
    private List<ProjectMediaResponse> media;
    private OffsetDateTime publishedAt;
    private OffsetDateTime closedAt;
    private OffsetDateTime submittedAt;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
