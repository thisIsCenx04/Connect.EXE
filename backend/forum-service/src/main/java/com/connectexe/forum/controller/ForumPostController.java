package com.connectexe.forum.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.forum.domain.enums.PostStatus;
import com.connectexe.forum.dto.ForumCommentRequest;
import com.connectexe.forum.dto.ForumCommentResponse;
import com.connectexe.forum.dto.ForumPostCreateRequest;
import com.connectexe.forum.dto.ForumPostResponse;
import com.connectexe.forum.dto.ForumPostUpdateRequest;
import com.connectexe.forum.dto.ForumVoteRequest;
import com.connectexe.forum.security.UserPrincipal;
import com.connectexe.forum.service.ForumPostService;
import com.connectexe.forum.service.ForumRealtimeService;
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
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/forum/posts")
public class ForumPostController {

    private final ForumPostService postService;
    private final ForumRealtimeService realtimeService;

    public ForumPostController(ForumPostService postService, ForumRealtimeService realtimeService) {
        this.postService = postService;
        this.realtimeService = realtimeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ForumPostResponse>>> list(
        @RequestParam(value = "categoryId", required = false) UUID categoryId,
        @RequestParam(value = "categorySlug", required = false) String categorySlug,
        @RequestParam(value = "sort", required = false) String sort,
        @RequestParam(value = "status", required = false) PostStatus status,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ForumPostResponse> response = postService.list(categoryId, categorySlug, sort, status, principal);
        return ResponseEntity.ok(ApiResponse.ok("Forum posts loaded", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumPostResponse>> get(@PathVariable("id") UUID id,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        ForumPostResponse response = postService.get(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Forum post loaded", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ForumPostResponse>> create(@Valid @RequestBody ForumPostCreateRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        ForumPostResponse response = postService.create(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Forum post created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ForumPostResponse>> update(@PathVariable("id") UUID id,
                                                                 @Valid @RequestBody ForumPostUpdateRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        ForumPostResponse response = postService.update(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Forum post updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") UUID id,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        postService.delete(id, principal);
        return ResponseEntity.ok(ApiResponse.<Void>ok("Forum post deleted", null));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<ForumCommentResponse>>> listComments(@PathVariable("id") UUID id) {
        List<ForumCommentResponse> response = postService.listComments(id);
        return ResponseEntity.ok(ApiResponse.ok("Forum comments loaded", response));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<ForumCommentResponse>> createComment(@PathVariable("id") UUID id,
                                                                           @Valid @RequestBody ForumCommentRequest request,
                                                                           @AuthenticationPrincipal UserPrincipal principal) {
        ForumCommentResponse response = postService.addComment(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Forum comment created", response));
    }

    @PostMapping("/{id}/votes")
    public ResponseEntity<ApiResponse<ForumPostResponse>> vote(@PathVariable("id") UUID id,
                                                               @Valid @RequestBody ForumVoteRequest request,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        ForumPostResponse response = postService.vote(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Vote recorded", response));
    }

    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable("id") UUID id) {
        return realtimeService.subscribe(id);
    }
}
