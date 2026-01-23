package com.connectexe.project.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.domain.enums.ProjectModerationStatus;
import com.connectexe.project.domain.enums.ProjectVisibility;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUpdateRequest {
    @Size(max = 200)
    private String title;

    private String description;

    private String summary;

    private String content;

    private ProjectStage stage;

    @Size(max = 120)
    private String industry;

    private DealType dealType;

    @Size(max = 2)
    private String country;

    private BigDecimal fundingNeedUsd;

    private BigDecimal fundingTargetUsd;

    private BigDecimal fundingRaisedUsd;

    private BigDecimal valuationUsd;

    private BigDecimal equityPercent;

    private String tractionSummary;

    private String fundingTimeline;

    private String tractionMetrics;

    private String pitchDeckUrl;

    private ProjectStatus status;

    private ProjectModerationStatus moderationStatus;

    private ProjectVisibility visibility;

    private Boolean featured;

    private Integer featuredRank;

    private List<String> tags;

    private List<ProjectLinkRequest> links;

    private List<ProjectMediaRequest> media;

}
