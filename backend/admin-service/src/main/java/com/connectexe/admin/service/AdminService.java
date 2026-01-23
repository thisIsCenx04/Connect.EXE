package com.connectexe.admin.service;

import com.connectexe.admin.domain.entity.InvestorKyc;
import com.connectexe.admin.domain.entity.Project;
import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.PlanCode;
import com.connectexe.admin.domain.enums.ProjectModerationStatus;
import com.connectexe.admin.domain.enums.ProjectStatus;
import com.connectexe.admin.domain.enums.ProjectVisibility;
import com.connectexe.admin.domain.enums.SubscriptionStatus;
import com.connectexe.admin.domain.enums.VerificationStatus;
import com.connectexe.admin.dto.AdminKycReviewRequest;
import com.connectexe.admin.dto.AdminKycSummary;
import com.connectexe.admin.dto.AdminOverviewResponse;
import com.connectexe.admin.dto.AdminProjectReviewRequest;
import com.connectexe.admin.dto.AdminProjectSummary;
import com.connectexe.admin.dto.AdminUserStatusRequest;
import com.connectexe.admin.dto.AdminUserSummary;
import com.connectexe.admin.dto.AiUsageAggregate;
import com.connectexe.admin.dto.AiUsageSummary;
import com.connectexe.admin.dto.PlanRevenueAggregate;
import com.connectexe.admin.dto.RevenuePlanSummary;
import com.connectexe.admin.dto.RevenueSummary;
import com.connectexe.admin.repository.AiRequestRepository;
import com.connectexe.admin.repository.InvestorKycRepository;
import com.connectexe.admin.repository.ProjectRepository;
import com.connectexe.admin.repository.SubscriptionRepository;
import com.connectexe.admin.repository.UserRepository;
import com.connectexe.common.exception.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final InvestorKycRepository investorKycRepository;
    private final ProjectRepository projectRepository;
    private final AiRequestRepository aiRequestRepository;
    private final SubscriptionRepository subscriptionRepository;

    public AdminService(UserRepository userRepository,
                        InvestorKycRepository investorKycRepository,
                        ProjectRepository projectRepository,
                        AiRequestRepository aiRequestRepository,
                        SubscriptionRepository subscriptionRepository) {
        this.userRepository = userRepository;
        this.investorKycRepository = investorKycRepository;
        this.projectRepository = projectRepository;
        this.aiRequestRepository = aiRequestRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public AdminOverviewResponse getOverview() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long pendingKyc = investorKycRepository.countByStatus(VerificationStatus.PENDING);
        long pendingProjects = projectRepository.countByModerationStatus(ProjectModerationStatus.PENDING);
        long totalProjects = projectRepository.count();
        long activeSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        long totalAiRequests = aiRequestRepository.count();

        OffsetDateTime since = OffsetDateTime.now().minusDays(30);
        long aiRequestsLast30Days = aiRequestRepository.countByCreatedAtAfter(since);
        List<AiUsageAggregate> usageAggregates = aiRequestRepository.findUsageSince(since);
        BigDecimal aiSpendLast30Days = usageAggregates.stream()
            .map(AiUsageAggregate::getCostUsd)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        RevenueSummary revenueSummary = getRevenueSummary();
        return new AdminOverviewResponse(
            totalUsers,
            activeUsers,
            pendingKyc,
            pendingProjects,
            totalProjects,
            activeSubscriptions,
            totalAiRequests,
            aiRequestsLast30Days,
            aiSpendLast30Days,
            revenueSummary.getEstimatedMonthlyRevenue()
        );
    }

    public List<AdminUserSummary> listUsers(String query, Boolean active) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        List<User> users;
        if (normalizedQuery == null) {
            if (active == null) {
                users = userRepository.findAll(sort);
            } else {
                users = userRepository.findByActive(active, sort);
            }
        } else if (active == null) {
            users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                normalizedQuery,
                normalizedQuery,
                sort
            );
        } else {
            users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseAndActive(
                normalizedQuery,
                normalizedQuery,
                active,
                sort
            );
        }
        return users.stream()
            .map(this::toUserSummary)
            .toList();
    }

    public AdminUserSummary updateUserStatus(UUID userId, AdminUserStatusRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setActive(Boolean.TRUE.equals(request.getActive()));
        User saved = userRepository.save(user);
        return toUserSummary(saved);
    }

    public List<AdminKycSummary> listKyc(VerificationStatus status) {
        List<InvestorKyc> kycs = status == null
            ? investorKycRepository.findAll()
            : investorKycRepository.findByStatus(status);
        if (kycs.isEmpty()) {
            return List.of();
        }
        Map<UUID, User> userById = userRepository.findAllById(
                kycs.stream().map(InvestorKyc::getUserId).distinct().toList())
            .stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));
        return kycs.stream()
            .sorted(Comparator.comparing(InvestorKyc::getSubmittedAt).reversed())
            .map(kyc -> toKycSummary(kyc, userById.get(kyc.getUserId())))
            .toList();
    }

    public AdminKycSummary reviewKyc(UUID userId, AdminKycReviewRequest request, User reviewer) {
        if (request.getStatus() == VerificationStatus.PENDING || request.getStatus() == VerificationStatus.NONE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Review status must be APPROVED or REJECTED");
        }
        InvestorKyc kyc = investorKycRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "KYC_NOT_FOUND", "KYC not found"));
        kyc.setStatus(request.getStatus());
        kyc.setReviewNote(request.getReviewNote());
        kyc.setReviewedBy(reviewer.getId());
        kyc.setReviewedAt(OffsetDateTime.now());
        InvestorKyc savedKyc = investorKycRepository.save(kyc);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setVerifiedStatus(request.getStatus());
        if (request.getStatus() == VerificationStatus.APPROVED) {
            if (kyc.getRequestedRole() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "REQUESTED_ROLE_MISSING", "Requested role is missing");
            }
            user.setRole(kyc.getRequestedRole());
            user.setVerifiedAt(OffsetDateTime.now());
        } else {
            user.setVerifiedAt(null);
        }
        User savedUser = userRepository.save(user);
        return toKycSummary(savedKyc, savedUser);
    }

    public List<AdminProjectSummary> listProjects(ProjectModerationStatus status) {
        List<Project> projects = status == null
            ? projectRepository.findAll()
            : projectRepository.findByModerationStatus(status);
        return projects.stream()
            .sorted(Comparator.comparing(Project::getCreatedAt).reversed())
            .map(this::toProjectSummary)
            .toList();
    }

    public AdminProjectSummary reviewProject(UUID projectId, AdminProjectReviewRequest request, User reviewer) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROJECT_NOT_FOUND", "Project not found"));

        ProjectModerationStatus status = request.getStatus();
        if (status == ProjectModerationStatus.APPROVED) {
            project.setModerationStatus(ProjectModerationStatus.APPROVED);
            project.setVisibility(ProjectVisibility.PUBLIC);
            project.setStatus(ProjectStatus.PUBLISHED);
            project.setReviewedBy(reviewer.getId());
            project.setReviewedAt(OffsetDateTime.now());
            if (project.getPublishedAt() == null) {
                project.setPublishedAt(OffsetDateTime.now());
            }
        } else if (status == ProjectModerationStatus.REJECTED) {
            project.setModerationStatus(ProjectModerationStatus.REJECTED);
            project.setVisibility(ProjectVisibility.PRIVATE);
            project.setReviewedBy(reviewer.getId());
            project.setReviewedAt(OffsetDateTime.now());
        } else {
            project.setModerationStatus(ProjectModerationStatus.PENDING);
            project.setReviewedBy(null);
            project.setReviewedAt(null);
        }

        if (request.getFeatured() != null) {
            project.setFeatured(request.getFeatured());
        }
        if (request.getFeaturedRank() != null) {
            project.setFeaturedRank(request.getFeaturedRank());
        }

        Project saved = projectRepository.save(project);
        return toProjectSummary(saved);
    }

    public List<AiUsageSummary> listAiUsage(int days) {
        int safeDays = days <= 0 ? 30 : days;
        OffsetDateTime since = OffsetDateTime.now().minusDays(safeDays);
        List<AiUsageAggregate> aggregates = aiRequestRepository.findUsageSince(since);
        if (aggregates.isEmpty()) {
            return List.of();
        }
        Map<UUID, User> userById = userRepository.findAllById(
                aggregates.stream().map(AiUsageAggregate::getUserId).distinct().toList())
            .stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));

        List<AiUsageSummary> summaries = new ArrayList<>();
        for (AiUsageAggregate aggregate : aggregates) {
            User user = userById.get(aggregate.getUserId());
            summaries.add(new AiUsageSummary(
                aggregate.getUserId(),
                user == null ? null : user.getEmail(),
                user == null ? null : user.getFullName(),
                aggregate.getDay(),
                aggregate.getTotalRequests() == null ? 0 : aggregate.getTotalRequests(),
                aggregate.getPromptTokens() == null ? 0 : aggregate.getPromptTokens(),
                aggregate.getCompletionTokens() == null ? 0 : aggregate.getCompletionTokens(),
                aggregate.getCostUsd() == null ? BigDecimal.ZERO : aggregate.getCostUsd()
            ));
        }
        return summaries;
    }

    public RevenueSummary getRevenueSummary() {
        List<PlanRevenueAggregate> aggregates = subscriptionRepository.findPlanRevenue();
        List<RevenuePlanSummary> planSummaries = aggregates.stream()
            .map(aggregate -> new RevenuePlanSummary(
                PlanCode.valueOf(aggregate.getPlanCode()),
                aggregate.getActiveCount() == null ? 0 : aggregate.getActiveCount(),
                aggregate.getRevenue() == null ? BigDecimal.ZERO : aggregate.getRevenue()
            ))
            .toList();

        long totalActive = planSummaries.stream()
            .mapToLong(RevenuePlanSummary::getActiveSubscriptions)
            .sum();
        BigDecimal totalRevenue = planSummaries.stream()
            .map(RevenuePlanSummary::getEstimatedMonthlyRevenue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new RevenueSummary(totalActive, totalRevenue, planSummaries);
    }

    private AdminUserSummary toUserSummary(User user) {
        return new AdminUserSummary(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getVerifiedStatus(),
            user.isActive(),
            user.isEmailVerified(),
            user.getCreatedAt()
        );
    }

    private AdminKycSummary toKycSummary(InvestorKyc kyc, User user) {
        return new AdminKycSummary(
            kyc.getId(),
            kyc.getUserId(),
            user == null ? null : user.getEmail(),
            user == null ? null : user.getFullName(),
            kyc.getStatus(),
            kyc.getRequestedRole(),
            kyc.getLegalName(),
            kyc.getOrganization(),
            kyc.getWebsite(),
            kyc.getLinkedinUrl(),
            kyc.getDocType(),
            kyc.getDocNumber(),
            kyc.getDocFileUrl(),
            kyc.getSubmittedAt(),
            kyc.getReviewedAt(),
            kyc.getReviewNote()
        );
    }

    private AdminProjectSummary toProjectSummary(Project project) {
        return new AdminProjectSummary(
            project.getId(),
            project.getOwnerId(),
            project.getTitle(),
            project.getStage(),
            project.getIndustry(),
            project.getModerationStatus(),
            project.getVisibility(),
            project.getStatus(),
            project.isFeatured(),
            project.getFeaturedRank(),
            project.getSubmittedAt(),
            project.getReviewedAt(),
            project.getCreatedAt()
        );
    }
}
