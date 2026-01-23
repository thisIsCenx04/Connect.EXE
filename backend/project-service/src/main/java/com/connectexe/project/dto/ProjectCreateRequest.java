package com.connectexe.project.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectMemberRole;
import com.connectexe.project.domain.enums.ProjectStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCreateRequest {
    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String description;

    private String summary;

    private String content;

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

    private BigDecimal fundingTargetUsd;

    private BigDecimal fundingRaisedUsd;

    private BigDecimal valuationUsd;

    private BigDecimal equityPercent;

    private String tractionSummary;

    private String fundingTimeline;

    private String tractionMetrics;

    private String pitchDeckUrl;

    private ProjectMemberRole creatorRole;

    private List<String> tags;

    private List<ProjectLinkRequest> links;

    private List<ProjectMediaRequest> media;

}
