package com.connectexe.halloffame.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.halloffame.domain.enums.HallOfFamePostStatus;
import com.connectexe.halloffame.domain.enums.HallOfFamePostType;
import com.connectexe.halloffame.dto.HallOfFamePostRequest;
import com.connectexe.halloffame.dto.HallOfFamePostResponse;
import com.connectexe.halloffame.security.UserPrincipal;
import com.connectexe.halloffame.service.HallOfFamePostService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/hall-of-fame/posts")
public class HallOfFamePostController {

    private final HallOfFamePostService postService;

    public HallOfFamePostController(HallOfFamePostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HallOfFamePostResponse>>> list(
        @RequestParam(value = "type", required = false) HallOfFamePostType type,
        @RequestParam(value = "status", required = false) HallOfFamePostStatus status,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<HallOfFamePostResponse> response = postService.list(type, status, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame posts loaded", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> get(@PathVariable("id") UUID id,
                                                                   @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.get(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post loaded", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> create(@Valid @RequestBody HallOfFamePostRequest request,
                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.create(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> update(@PathVariable("id") UUID id,
                                                                      @Valid @RequestBody HallOfFamePostRequest request,
                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.update(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post updated", response));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> publish(@PathVariable("id") UUID id,
                                                                       @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.publish(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post published", response));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> archive(@PathVariable("id") UUID id,
                                                                       @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.archive(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post archived", response));
    }

    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<HallOfFamePostResponse>> convert(@Valid @RequestBody HallOfFamePostRequest request,
                                                                       @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFamePostResponse response = postService.convertFromProject(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame post created from project", response));
    }
}
