package com.connectexe.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.admin.domain.enums.ProjectModerationStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectReviewRequest {
    @NotNull(message = "Moderation status is required")
    private ProjectModerationStatus status;
    private Boolean featured;
    private Integer featuredRank;
}
