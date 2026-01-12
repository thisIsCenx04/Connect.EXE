package com.connectexe.project.dto;

import com.connectexe.project.domain.enums.ProjectMemberRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectMemberResponse {
    private final UUID id;
    private final UUID projectId;
    private final UUID userId;
    private final ProjectMemberRole role;
    private final OffsetDateTime createdAt;

    public ProjectMemberResponse(UUID id,
                                 UUID projectId,
                                 UUID userId,
                                 ProjectMemberRole role,
                                 OffsetDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getUserId() {
        return userId;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
