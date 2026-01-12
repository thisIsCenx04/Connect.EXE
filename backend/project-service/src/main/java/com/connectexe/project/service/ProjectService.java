package com.connectexe.project.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.project.domain.entity.Project;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.dto.ProjectCreateRequest;
import com.connectexe.project.dto.ProjectResponse;
import com.connectexe.project.dto.ProjectUpdateRequest;
import com.connectexe.project.repository.ProjectRepository;
import com.connectexe.project.repository.ProjectSpecifications;
import com.connectexe.project.security.UserPrincipal;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ProjectResponse create(ProjectCreateRequest request, UserPrincipal principal) {
        requireFounder(principal);
        Project project = new Project();
        project.setOwnerId(principal.getUserId());
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setStage(request.getStage());
        project.setIndustry(request.getIndustry());
        project.setDealType(request.getDealType());
        project.setCountry(request.getCountry());
        project.setFundingNeedUsd(request.getFundingNeedUsd());
        project.setEquityPercent(request.getEquityPercent());
        project.setTractionSummary(request.getTractionSummary());
        project.setPitchDeckUrl(request.getPitchDeckUrl());
        project.setStatus(ProjectStatus.DRAFT);
        project.setSlug(generateSlug(request.getTitle()));

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public ProjectResponse update(UUID id, ProjectUpdateRequest request, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        requireOwnerOrAdmin(project, principal);

        if (request.getTitle() != null) {
            project.setTitle(request.getTitle());
            project.setSlug(generateSlug(request.getTitle()));
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStage() != null) {
            project.setStage(request.getStage());
        }
        if (request.getIndustry() != null) {
            project.setIndustry(request.getIndustry());
        }
        if (request.getDealType() != null) {
            project.setDealType(request.getDealType());
        }
        if (request.getCountry() != null) {
            project.setCountry(request.getCountry());
        }
        if (request.getFundingNeedUsd() != null) {
            project.setFundingNeedUsd(request.getFundingNeedUsd());
        }
        if (request.getEquityPercent() != null) {
            project.setEquityPercent(request.getEquityPercent());
        }
        if (request.getTractionSummary() != null) {
            project.setTractionSummary(request.getTractionSummary());
        }
        if (request.getPitchDeckUrl() != null) {
            project.setPitchDeckUrl(request.getPitchDeckUrl());
        }
        if (request.getFeatured() != null) {
            project.setFeatured(request.getFeatured());
        }
        if (request.getFeaturedRank() != null) {
            project.setFeaturedRank(request.getFeaturedRank());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
            if (request.getStatus() == ProjectStatus.PUBLISHED && project.getPublishedAt() == null) {
                project.setPublishedAt(OffsetDateTime.now());
            }
            if (request.getStatus() == ProjectStatus.CLOSED && project.getClosedAt() == null) {
                project.setClosedAt(OffsetDateTime.now());
            }
        }

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public void delete(UUID id, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        requireOwnerOrAdmin(project, principal);
        projectRepository.delete(project);
    }

    public ProjectResponse get(UUID id, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        if (project.getStatus() == ProjectStatus.PUBLISHED || isOwnerOrAdmin(project, principal)) {
            return toResponse(project);
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
    }

    public List<ProjectResponse> list(ProjectFilters filters) {
        Specification<Project> spec = Specification.where(ProjectSpecifications.hasStage(filters.stage()))
            .and(ProjectSpecifications.hasIndustry(filters.industry()))
            .and(ProjectSpecifications.hasCountry(filters.country()))
            .and(ProjectSpecifications.hasDealType(filters.dealType()))
            .and(ProjectSpecifications.hasStatus(filters.status()));

        List<Project> projects = projectRepository.findAll(spec);
        return projects.stream().map(this::toResponse).toList();
    }

    public List<ProjectResponse> listMine(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
        return projectRepository.findByOwnerId(principal.getUserId()).stream()
            .map(this::toResponse)
            .toList();
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getOwnerId(),
            project.getTitle(),
            project.getSlug(),
            project.getDescription(),
            project.getStage(),
            project.getIndustry(),
            project.getCountry(),
            project.getStatus(),
            project.getDealType(),
            project.getFundingNeedUsd(),
            project.getEquityPercent(),
            project.getTractionSummary(),
            project.getPitchDeckUrl(),
            project.isFeatured(),
            project.getFeaturedRank(),
            project.getPublishedAt(),
            project.getClosedAt(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    private String generateSlug(String title) {
        String base = title == null ? "" : title.toLowerCase(Locale.US)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        String slug = base.isBlank() ? UUID.randomUUID().toString() : base;
        if (!projectRepository.existsBySlug(slug)) {
            return slug;
        }
        return slug + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void requireFounder(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
        if (!principal.getRoles().contains("ROLE_FOUNDER") && !principal.getRoles().contains("ROLE_ADMIN")) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only founders can manage projects");
        }
    }

    private void requireOwnerOrAdmin(Project project, UserPrincipal principal) {
        if (!isOwnerOrAdmin(project, principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private boolean isOwnerOrAdmin(Project project, UserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        if (principal.getRoles().contains("ROLE_ADMIN")) {
            return true;
        }
        return project.getOwnerId().equals(principal.getUserId());
    }

    public record ProjectFilters(
        com.connectexe.project.domain.enums.ProjectStage stage,
        String industry,
        String country,
        com.connectexe.project.domain.enums.DealType dealType,
        com.connectexe.project.domain.enums.ProjectStatus status
    ) {}
}
