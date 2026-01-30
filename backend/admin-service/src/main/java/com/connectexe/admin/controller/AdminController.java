package com.connectexe.admin.controller;

import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.ProjectModerationStatus;
import com.connectexe.admin.domain.enums.VerificationStatus;
import com.connectexe.admin.dto.AdminKycReviewRequest;
import com.connectexe.admin.dto.AdminKycSummary;
import com.connectexe.admin.dto.AdminOverviewResponse;
import com.connectexe.admin.dto.AdminProjectReviewRequest;
import com.connectexe.admin.dto.AdminProjectSummary;
import com.connectexe.admin.dto.AdminUserStatusRequest;
import com.connectexe.admin.dto.AdminUserSummary;
import com.connectexe.admin.dto.AiUsageSummary;
import com.connectexe.admin.dto.RevenueSummary;
import com.connectexe.admin.service.AdminService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOverviewResponse>> getOverview(
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        AdminOverviewResponse response = adminService.getOverview(token);
        return ResponseEntity.ok(ApiResponse.ok("Overview loaded", response));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserSummary>>> listUsers(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        List<AdminUserSummary> users = adminService.listUsers(query, active, token);
        return ResponseEntity.ok(ApiResponse.ok("Users loaded", users));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserSummary>> updateUserStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminUserStatusRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        AdminUserSummary user = adminService.updateUserStatus(id, request, token);
        return ResponseEntity.ok(ApiResponse.ok("User updated", user));
    }

    @GetMapping("/kyc")
    public ResponseEntity<ApiResponse<List<AdminKycSummary>>> listKyc(
            @RequestParam(value = "status", required = false) VerificationStatus status) {
        List<AdminKycSummary> list = adminService.listKyc(status);
        return ResponseEntity.ok(ApiResponse.ok("KYC loaded", list));
    }

    @PatchMapping("/kyc/{userId}")
    public ResponseEntity<ApiResponse<AdminKycSummary>> reviewKyc(
            @PathVariable("userId") UUID userId,
            @Valid @RequestBody AdminKycReviewRequest request,
            @AuthenticationPrincipal User reviewer) {
        AdminKycSummary summary = adminService.reviewKyc(userId, request, reviewer);
        return ResponseEntity.ok(ApiResponse.ok("KYC reviewed", summary));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<AdminProjectSummary>>> listProjects(
            @RequestParam(value = "status", required = false) ProjectModerationStatus status) {
        List<AdminProjectSummary> projects = adminService.listProjects(status);
        return ResponseEntity.ok(ApiResponse.ok("Projects loaded", projects));
    }

    @PatchMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<AdminProjectSummary>> reviewProject(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminProjectReviewRequest request,
            @AuthenticationPrincipal User reviewer) {
        AdminProjectSummary summary = adminService.reviewProject(id, request, reviewer);
        return ResponseEntity.ok(ApiResponse.ok("Project updated", summary));
    }

    @GetMapping("/ai/usage")
    public ResponseEntity<ApiResponse<List<AiUsageSummary>>> listAiUsage(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        List<AiUsageSummary> summary = adminService.listAiUsage(days);
        return ResponseEntity.ok(ApiResponse.ok("AI usage loaded", summary));
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<ApiResponse<RevenueSummary>> getRevenueSummary() {
        RevenueSummary summary = adminService.getRevenueSummary();
        return ResponseEntity.ok(ApiResponse.ok("Revenue summary loaded", summary));
    }
}
