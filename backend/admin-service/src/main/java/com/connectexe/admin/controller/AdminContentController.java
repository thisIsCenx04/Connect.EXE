package com.connectexe.admin.controller;

import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ContentType;
import com.connectexe.admin.dto.ContentResponse;
import com.connectexe.admin.dto.ContentUpsertRequest;
import com.connectexe.admin.dto.ResourceResponse;
import com.connectexe.admin.dto.ResourceUpsertRequest;
import com.connectexe.admin.service.ContentService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {

    private final ContentService contentService;

    public AdminContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContentResponse>>> listContent(
            @RequestParam(value = "type", required = false) ContentType type,
            @RequestParam(value = "status", required = false) ContentStatus status) {
        List<ContentResponse> list = contentService.listAdminContent(type, status);
        return ResponseEntity.ok(ApiResponse.ok("Content loaded", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContentResponse>> createContent(
            @Valid @RequestBody ContentUpsertRequest request,
            @AuthenticationPrincipal User creator) {
        ContentResponse response = contentService.createContent(request, creator);
        return ResponseEntity.ok(ApiResponse.ok("Content created", response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> updateContent(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ContentUpsertRequest request) {
        ContentResponse response = contentService.updateContent(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Content updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable("id") UUID id) {
        contentService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.ok("Content deleted", null));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> listResources(
            @RequestParam(value = "status", required = false) ContentStatus status) {
        List<ResourceResponse> list = contentService.listAdminResources(status);
        return ResponseEntity.ok(ApiResponse.ok("Resources loaded", list));
    }

    @PostMapping("/resources")
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(
            @Valid @RequestBody ResourceUpsertRequest request,
            @AuthenticationPrincipal User creator) {
        ResourceResponse response = contentService.createResource(request, creator);
        return ResponseEntity.ok(ApiResponse.ok("Resource created", response));
    }

    @PatchMapping("/resources/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ResourceUpsertRequest request) {
        ResourceResponse response = contentService.updateResource(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Resource updated", response));
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable("id") UUID id) {
        contentService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource deleted", null));
    }
}
