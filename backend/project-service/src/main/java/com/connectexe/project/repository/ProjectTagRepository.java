package com.connectexe.project.repository;

import com.connectexe.project.domain.entity.ProjectTag;
import com.connectexe.project.domain.entity.ProjectTag.ProjectTagId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, ProjectTagId> {
    List<ProjectTag> findByProjectId(UUID projectId);
    void deleteByProjectId(UUID projectId);
}
