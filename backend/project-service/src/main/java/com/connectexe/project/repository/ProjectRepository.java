package com.connectexe.project.repository;

import com.connectexe.project.domain.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
    List<Project> findByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    @Query("SELECT DISTINCT p.industry FROM Project p WHERE p.industry IS NOT NULL ORDER BY p.industry")
    List<String> findDistinctIndustries();
}
