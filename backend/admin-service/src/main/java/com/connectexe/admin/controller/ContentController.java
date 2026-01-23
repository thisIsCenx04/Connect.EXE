package com.connectexe.admin.controller;

import com.connectexe.admin.domain.enums.ContentType;
import com.connectexe.admin.dto.ContentResponse;
import com.connectexe.admin.dto.ResourceResponse;
import com.connectexe.admin.service.ContentService;
import com.connectexe.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/content")
    public ResponseEntity<ApiResponse<List<ContentResponse>>> listContent(
            @RequestParam(value = "type", required = false) ContentType type) {
        List<ContentResponse> list = contentService.listPublicContent(type);
        return ResponseEntity.ok(ApiResponse.ok("Content loaded", list));
    }

    @GetMapping("/content/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> getContent(@PathVariable("id") UUID id) {
        ContentResponse response = contentService.getPublicContent(id);
        return ResponseEntity.ok(ApiResponse.ok("Content loaded", response));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> listResources() {
        List<ResourceResponse> list = contentService.listPublicResources();
        return ResponseEntity.ok(ApiResponse.ok("Resources loaded", list));
    }

    @GetMapping("/resources/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResource(@PathVariable("id") UUID id) {
        ResourceResponse response = contentService.getPublicResource(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource loaded", response));
    }
}
