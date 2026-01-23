package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.admin.domain.enums.ProjectModerationStatus;
import com.connectexe.admin.domain.enums.ProjectStage;
import com.connectexe.admin.domain.enums.ProjectStatus;
import com.connectexe.admin.domain.enums.ProjectVisibility;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectSummary {
    private UUID id;
    private UUID ownerId;
    private String title;
    private ProjectStage stage;
    private String industry;
    private ProjectModerationStatus moderationStatus;
    private ProjectVisibility visibility;
    private ProjectStatus status;
    private boolean featured;
    private Integer featuredRank;
    private OffsetDateTime submittedAt;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime createdAt;
}
