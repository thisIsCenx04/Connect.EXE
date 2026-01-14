package com.connectexe.project.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.project.domain.entity.Project;
import com.connectexe.project.domain.entity.ProjectAttachment;
import com.connectexe.project.domain.entity.ProjectMember;
import com.connectexe.project.domain.entity.ProjectLink;
import com.connectexe.project.domain.entity.ProjectTag;
import com.connectexe.project.domain.enums.ProjectMemberRole;
import com.connectexe.project.domain.enums.ProjectModerationStatus;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.domain.enums.ProjectVisibility;
import com.connectexe.project.dto.ProjectMemberAddRequest;
import com.connectexe.project.dto.ProjectMemberResponse;
import com.connectexe.project.dto.ProjectLinkResponse;
import com.connectexe.project.dto.ProjectMediaResponse;
import com.connectexe.project.repository.ProjectMemberRepository;
import com.connectexe.project.dto.ProjectCreateRequest;
import com.connectexe.project.dto.ProjectResponse;
import com.connectexe.project.dto.ProjectUpdateRequest;
import com.connectexe.project.repository.ProjectAttachmentRepository;
import com.connectexe.project.repository.ProjectLinkRepository;
import com.connectexe.project.repository.ProjectRepository;
import com.connectexe.project.repository.ProjectSpecifications;
import com.connectexe.project.repository.ProjectTagRepository;
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
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectLinkRepository projectLinkRepository;
    private final ProjectAttachmentRepository projectAttachmentRepository;
    private final ProjectTagRepository projectTagRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          ProjectLinkRepository projectLinkRepository,
                          ProjectAttachmentRepository projectAttachmentRepository,
                          ProjectTagRepository projectTagRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectLinkRepository = projectLinkRepository;
        this.projectAttachmentRepository = projectAttachmentRepository;
        this.projectTagRepository = projectTagRepository;
    }

    public ProjectResponse create(ProjectCreateRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        Project project = new Project();
        project.setOwnerId(principal.getUserId());
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setSummary(request.getSummary() == null ? request.getDescription() : request.getSummary());
        project.setContent(request.getContent() == null ? request.getDescription() : request.getContent());
        project.setStage(request.getStage());
        project.setIndustry(request.getIndustry());
        project.setDealType(request.getDealType());
        project.setCountry(request.getCountry());
        project.setFundingTargetUsd(request.getFundingTargetUsd());
        project.setFundingNeedUsd(request.getFundingNeedUsd());
        project.setFundingRaisedUsd(request.getFundingRaisedUsd());
        project.setValuationUsd(request.getValuationUsd());
        project.setEquityPercent(request.getEquityPercent());
        project.setTractionSummary(request.getTractionSummary());
        project.setFundingTimeline(request.getFundingTimeline());
        project.setTractionMetrics(request.getTractionMetrics());
        project.setPitchDeckUrl(request.getPitchDeckUrl());
        project.setStatus(ProjectStatus.DRAFT);
        project.setModerationStatus(ProjectModerationStatus.PENDING);
        project.setVisibility(ProjectVisibility.PRIVATE);
        project.setSlug(generateSlug(request.getTitle()));

        Project saved = projectRepository.save(project);
        replaceTags(saved.getId(), request.getTags());
        replaceLinks(saved.getId(), request.getLinks());
        replaceMedia(saved.getId(), request.getMedia());
        ProjectMember founder = new ProjectMember();
        founder.setProjectId(saved.getId());
        founder.setUserId(principal.getUserId());
        ProjectMemberRole creatorRole =
            request.getCreatorRole() == null ? ProjectMemberRole.FOUNDER : request.getCreatorRole();
        founder.setRole(creatorRole);
        projectMemberRepository.save(founder);
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
        if (request.getSummary() != null) {
            project.setSummary(request.getSummary());
        }
        if (request.getContent() != null) {
            project.setContent(request.getContent());
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
        if (request.getFundingTargetUsd() != null) {
            project.setFundingTargetUsd(request.getFundingTargetUsd());
        }
        if (request.getFundingNeedUsd() != null) {
            project.setFundingNeedUsd(request.getFundingNeedUsd());
        }
        if (request.getFundingRaisedUsd() != null) {
            project.setFundingRaisedUsd(request.getFundingRaisedUsd());
        }
        if (request.getValuationUsd() != null) {
            project.setValuationUsd(request.getValuationUsd());
        }
        if (request.getEquityPercent() != null) {
            project.setEquityPercent(request.getEquityPercent());
        }
        if (request.getTractionSummary() != null) {
            project.setTractionSummary(request.getTractionSummary());
        }
        if (request.getFundingTimeline() != null) {
            project.setFundingTimeline(request.getFundingTimeline());
        }
        if (request.getTractionMetrics() != null) {
            project.setTractionMetrics(request.getTractionMetrics());
        }
        if (request.getPitchDeckUrl() != null) {
            project.setPitchDeckUrl(request.getPitchDeckUrl());
        }
        if (request.getModerationStatus() != null) {
            if (!isAdmin(principal)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can change moderation status");
            }
            project.setModerationStatus(request.getModerationStatus());
        }
        if (request.getVisibility() != null) {
            if (!isAdmin(principal)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can change visibility");
            }
            project.setVisibility(request.getVisibility());
        }
        if (request.getFeatured() != null) {
            project.setFeatured(request.getFeatured());
        }
        if (request.getFeaturedRank() != null) {
            project.setFeaturedRank(request.getFeaturedRank());
        }
        if (request.getStatus() != null) {
            if (!isAdmin(principal)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can change status");
            }
            project.setStatus(request.getStatus());
            if (request.getStatus() == ProjectStatus.PUBLISHED && project.getPublishedAt() == null) {
                project.setPublishedAt(OffsetDateTime.now());
            }
            if (request.getStatus() == ProjectStatus.CLOSED && project.getClosedAt() == null) {
                project.setClosedAt(OffsetDateTime.now());
            }
        }

        Project saved = projectRepository.save(project);
        if (request.getTags() != null) {
            replaceTags(saved.getId(), request.getTags());
        }
        if (request.getLinks() != null) {
            replaceLinks(saved.getId(), request.getLinks());
        }
        if (request.getMedia() != null) {
            replaceMedia(saved.getId(), request.getMedia());
        }
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
        if (isPublic(project) || isOwnerOrAdmin(project, principal)) {
            return toResponse(project);
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
    }

    public ProjectResponse submitForReview(UUID id, UserPrincipal principal) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        requireOwnerOrAdmin(project, principal);
        project.setModerationStatus(ProjectModerationStatus.PENDING);
        project.setSubmittedAt(OffsetDateTime.now());
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public ProjectResponse approve(UUID id, UserPrincipal principal) {
        requireAdmin(principal);
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        project.setModerationStatus(ProjectModerationStatus.APPROVED);
        project.setVisibility(ProjectVisibility.PUBLIC);
        project.setStatus(ProjectStatus.PUBLISHED);
        project.setReviewedBy(principal.getUserId());
        project.setReviewedAt(OffsetDateTime.now());
        if (project.getPublishedAt() == null) {
            project.setPublishedAt(OffsetDateTime.now());
        }
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public ProjectResponse reject(UUID id, UserPrincipal principal) {
        requireAdmin(principal);
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        project.setModerationStatus(ProjectModerationStatus.REJECTED);
        project.setVisibility(ProjectVisibility.PRIVATE);
        project.setReviewedBy(principal.getUserId());
        project.setReviewedAt(OffsetDateTime.now());
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public ProjectResponse hide(UUID id, UserPrincipal principal) {
        requireAdmin(principal);
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        project.setVisibility(ProjectVisibility.HIDDEN);
        project.setStatus(ProjectStatus.HIDDEN);
        project.setReviewedBy(principal.getUserId());
        project.setReviewedAt(OffsetDateTime.now());
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public List<ProjectResponse> list(ProjectFilters filters, UserPrincipal principal) {
        if (filters.status() != null && filters.status() != ProjectStatus.PUBLISHED && !isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can view non-public projects");
        }
        if (!isAdmin(principal)) {
            if (filters.moderationStatus() != null && filters.moderationStatus() != ProjectModerationStatus.APPROVED) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can view unapproved projects");
            }
            if (filters.visibility() != null && filters.visibility() != ProjectVisibility.PUBLIC) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can view non-public projects");
            }
        }
        Specification<Project> spec = Specification.where(ProjectSpecifications.hasStage(filters.stage()))
            .and(ProjectSpecifications.hasIndustry(filters.industry()))
            .and(ProjectSpecifications.hasCountry(filters.country()))
            .and(ProjectSpecifications.hasDealType(filters.dealType()))
            .and(ProjectSpecifications.hasStatus(filters.status()))
            .and(ProjectSpecifications.hasModerationStatus(filters.moderationStatus()))
            .and(ProjectSpecifications.hasVisibility(filters.visibility()));

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

    public ProjectMemberResponse addMember(UUID projectId,
                                           ProjectMemberAddRequest request,
                                           UserPrincipal principal) {
        requireAuthenticated(principal);
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));
        requireOwnerOrAdmin(project, principal);

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.getUserId())) {
            throw new ApiException(HttpStatus.CONFLICT, "MEMBER_EXISTS", "Member already added");
        }

        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(request.getUserId());
        member.setRole(request.getRole());
        ProjectMember saved = projectMemberRepository.save(member);
        return toMemberResponse(saved);
    }

    private ProjectResponse toResponse(Project project) {
        List<String> tags = projectTagRepository.findByProjectId(project.getId()).stream()
            .map(ProjectTag::getTag)
            .toList();
        List<ProjectLinkResponse> links = projectLinkRepository.findByProjectIdOrderBySortOrderAsc(project.getId()).stream()
            .map(link -> new ProjectLinkResponse(
                link.getId(),
                link.getType(),
                link.getLabel(),
                link.getUrl(),
                link.getSortOrder()
            ))
            .toList();
        List<ProjectMediaResponse> media = projectAttachmentRepository.findByProjectIdOrderBySortOrderAsc(project.getId()).stream()
            .map(attachment -> new ProjectMediaResponse(
                attachment.getId(),
                attachment.getFileUrl(),
                attachment.getFileType(),
                attachment.getRole(),
                attachment.getSortOrder(),
                attachment.getCaption()
            ))
            .toList();
        return new ProjectResponse(
            project.getId(),
            project.getOwnerId(),
            project.getTitle(),
            project.getSlug(),
            project.getDescription(),
            project.getSummary(),
            project.getContent(),
            project.getStage(),
            project.getIndustry(),
            project.getCountry(),
            project.getStatus(),
            project.getModerationStatus(),
            project.getVisibility(),
            project.getDealType(),
            project.getFundingTargetUsd(),
            project.getFundingNeedUsd(),
            project.getFundingRaisedUsd(),
            project.getValuationUsd(),
            project.getEquityPercent(),
            project.getTractionSummary(),
            project.getFundingTimeline(),
            project.getTractionMetrics(),
            project.getPitchDeckUrl(),
            project.isFeatured(),
            project.getFeaturedRank(),
            tags,
            links,
            media,
            project.getPublishedAt(),
            project.getClosedAt(),
            project.getSubmittedAt(),
            project.getReviewedBy(),
            project.getReviewedAt(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    private ProjectMemberResponse toMemberResponse(ProjectMember member) {
        return new ProjectMemberResponse(
            member.getId(),
            member.getProjectId(),
            member.getUserId(),
            member.getRole(),
            member.getCreatedAt()
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

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
    }

    private void requireOwnerOrAdmin(Project project, UserPrincipal principal) {
        if (!isOwnerOrAdmin(project, principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private void requireAdmin(UserPrincipal principal) {
        if (!isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admin only");
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

    private boolean isAdmin(UserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        return principal.getRoles().contains("ROLE_ADMIN");
    }

    private boolean isPublic(Project project) {
        return project.getStatus() == ProjectStatus.PUBLISHED
            && project.getModerationStatus() == ProjectModerationStatus.APPROVED
            && project.getVisibility() == ProjectVisibility.PUBLIC;
    }

    private void replaceTags(UUID projectId, List<String> tags) {
        projectTagRepository.deleteByProjectId(projectId);
        if (tags == null || tags.isEmpty()) {
            return;
        }
        List<ProjectTag> entities = tags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(tag -> new ProjectTag(projectId, tag.trim()))
            .toList();
        projectTagRepository.saveAll(entities);
    }

    private void replaceLinks(UUID projectId, List<com.connectexe.project.dto.ProjectLinkRequest> links) {
        projectLinkRepository.deleteByProjectId(projectId);
        if (links == null || links.isEmpty()) {
            return;
        }
        List<ProjectLink> entities = links.stream()
            .map(link -> {
                ProjectLink entity = new ProjectLink();
                entity.setProjectId(projectId);
                entity.setType(link.getType());
                entity.setLabel(link.getLabel());
                entity.setUrl(link.getUrl());
                entity.setSortOrder(link.getSortOrder() == null ? 0 : link.getSortOrder());
                return entity;
            })
            .toList();
        projectLinkRepository.saveAll(entities);
    }

    private void replaceMedia(UUID projectId, List<com.connectexe.project.dto.ProjectMediaRequest> media) {
        projectAttachmentRepository.deleteByProjectId(projectId);
        if (media == null || media.isEmpty()) {
            return;
        }
        List<ProjectAttachment> entities = media.stream()
            .map(item -> {
                ProjectAttachment entity = new ProjectAttachment();
                entity.setProjectId(projectId);
                entity.setFileUrl(item.getFileUrl());
                entity.setFileType(item.getFileType());
                entity.setRole(item.getRole());
                entity.setSortOrder(item.getSortOrder());
                entity.setCaption(item.getCaption());
                return entity;
            })
            .toList();
        projectAttachmentRepository.saveAll(entities);
    }

    public record ProjectFilters(
        com.connectexe.project.domain.enums.ProjectStage stage,
        String industry,
        String country,
        com.connectexe.project.domain.enums.DealType dealType,
        com.connectexe.project.domain.enums.ProjectStatus status,
        com.connectexe.project.domain.enums.ProjectModerationStatus moderationStatus,
        com.connectexe.project.domain.enums.ProjectVisibility visibility
    ) {}
}
