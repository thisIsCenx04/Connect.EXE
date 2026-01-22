package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.Project;
import com.connectexe.admin.domain.enums.ProjectModerationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByModerationStatus(ProjectModerationStatus status);

    long countByModerationStatus(ProjectModerationStatus status);
}
