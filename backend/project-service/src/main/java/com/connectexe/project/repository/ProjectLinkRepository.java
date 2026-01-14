package com.connectexe.project.repository;

import com.connectexe.project.domain.entity.ProjectLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectLinkRepository extends JpaRepository<ProjectLink, UUID> {
    List<ProjectLink> findByProjectIdOrderBySortOrderAsc(UUID projectId);
    void deleteByProjectId(UUID projectId);
}
