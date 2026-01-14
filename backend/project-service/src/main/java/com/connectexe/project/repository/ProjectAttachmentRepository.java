package com.connectexe.project.repository;

import com.connectexe.project.domain.entity.ProjectAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectAttachmentRepository extends JpaRepository<ProjectAttachment, UUID> {
    List<ProjectAttachment> findByProjectIdOrderBySortOrderAsc(UUID projectId);
    void deleteByProjectId(UUID projectId);
}
