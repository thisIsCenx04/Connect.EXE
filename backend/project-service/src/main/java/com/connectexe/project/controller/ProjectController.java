package com.connectexe.project.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.project.domain.enums.DealType;
import com.connectexe.project.domain.enums.ProjectStage;
import com.connectexe.project.domain.enums.ProjectStatus;
import com.connectexe.project.dto.ProjectCreateRequest;
import com.connectexe.project.dto.ProjectMemberAddRequest;
import com.connectexe.project.dto.ProjectMemberResponse;
import com.connectexe.project.dto.ProjectResponse;
import com.connectexe.project.dto.ProjectUpdateRequest;
import com.connectexe.project.security.UserPrincipal;
import com.connectexe.project.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> create(@Valid @RequestBody ProjectCreateRequest request,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.create(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Project created", response));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> addMember(@PathVariable("id") UUID id,
                                                                        @Valid @RequestBody ProjectMemberAddRequest request,
                                                                        @AuthenticationPrincipal UserPrincipal principal) {
        ProjectMemberResponse response = projectService.addMember(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Member added", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(@PathVariable("id") UUID id,
                                                               @Valid @RequestBody ProjectUpdateRequest request,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.update(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Project updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") UUID id,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        projectService.delete(id, principal);
        return ResponseEntity.ok(ApiResponse.<Void>ok("Project deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> get(@PathVariable("id") UUID id,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.get(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Project loaded", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> list(
        @RequestParam(value = "stage", required = false) ProjectStage stage,
        @RequestParam(value = "industry", required = false) String industry,
        @RequestParam(value = "country", required = false) String country,
        @RequestParam(value = "dealType", required = false) DealType dealType,
        @RequestParam(value = "status", required = false) ProjectStatus status,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        ProjectStatus effectiveStatus = status == null ? ProjectStatus.PUBLISHED : status;
        List<ProjectResponse> response = projectService.list(
            new ProjectService.ProjectFilters(stage, industry, country, dealType, effectiveStatus),
            principal
        );
        return ResponseEntity.ok(ApiResponse.ok("Projects loaded", response));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> mine(@AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectResponse> response = projectService.listMine(principal);
        return ResponseEntity.ok(ApiResponse.ok("My projects loaded", response));
    }
}
