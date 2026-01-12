package com.connectexe.project.dto;

import com.connectexe.project.domain.enums.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ProjectMemberAddRequest {
    @NotNull
    private UUID userId;

    @NotNull
    private ProjectMemberRole role;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public void setRole(ProjectMemberRole role) {
        this.role = role;
    }
}
