package com.connectexe.auth.controller;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.dto.AdminUserStatusRequest;
import com.connectexe.auth.dto.AdminUserSummary;
import com.connectexe.auth.service.AdminUserService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminUserService adminUserService;

    public AdminController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserSummary>>> listUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean active,
            @AuthenticationPrincipal User user) {
        adminUserService.assertAdmin(user);
        List<AdminUserSummary> users = adminUserService.listUsers(query, active);
        return ResponseEntity.ok(ApiResponse.ok("Users loaded", users));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserSummary>> updateUserStatus(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminUserStatusRequest request,
            @AuthenticationPrincipal User user) {
        adminUserService.assertAdmin(user);
        AdminUserSummary updated = adminUserService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", updated));
    }

    @GetMapping("/users/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStats(@AuthenticationPrincipal User user) {
        adminUserService.assertAdmin(user);
        Map<String, Long> stats = Map.of(
            "totalUsers", adminUserService.countUsers(),
            "activeUsers", adminUserService.countActiveUsers()
        );
        return ResponseEntity.ok(ApiResponse.ok("User stats loaded", stats));
    }
}
