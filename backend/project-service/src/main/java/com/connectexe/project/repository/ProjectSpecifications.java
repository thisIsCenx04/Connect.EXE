package com.connectexe.project.repository;

import com.connectexe.project.domain.entity.Project;
import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectModerationStatus;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.domain.enums.ProjectVisibility;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpecifications {

    private ProjectSpecifications() {}

    public static Specification<Project> hasStage(ProjectStage stage) {
        return (root, query, cb) -> stage == null ? null : cb.equal(root.get("stage"), stage);
    }

    public static Specification<Project> hasIndustry(String industry) {
        return (root, query, cb) -> industry == null ? null : cb.equal(root.get("industry"), industry);
    }

    public static Specification<Project> hasCountry(String country) {
        return (root, query, cb) -> country == null ? null : cb.equal(root.get("country"), country);
    }

    public static Specification<Project> hasDealType(DealType dealType) {
        return (root, query, cb) -> dealType == null ? null : cb.equal(root.get("dealType"), dealType);
    }

    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Project> hasModerationStatus(ProjectModerationStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("moderationStatus"), status);
    }

    public static Specification<Project> hasVisibility(ProjectVisibility visibility) {
        return (root, query, cb) -> visibility == null ? null : cb.equal(root.get("visibility"), visibility);
    }
}
