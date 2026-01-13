package com.connectexe.halloffame.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import com.connectexe.halloffame.domain.enums.HallOfFameType;
import com.connectexe.halloffame.dto.HallOfFameApplyRequest;
import com.connectexe.halloffame.dto.HallOfFameDecisionRequest;
import com.connectexe.halloffame.dto.HallOfFameResponse;
import com.connectexe.halloffame.dto.HallOfFameVoteRequest;
import com.connectexe.halloffame.security.UserPrincipal;
import com.connectexe.halloffame.service.HallOfFameService;
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
@RequestMapping("/api/hall-of-fame")
public class HallOfFameController {

    private final HallOfFameService hallOfFameService;

    public HallOfFameController(HallOfFameService hallOfFameService) {
        this.hallOfFameService = hallOfFameService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HallOfFameResponse>>> list(
        @RequestParam(value = "type", required = false) HallOfFameType type,
        @RequestParam(value = "status", required = false) HallOfFameStatus status,
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<HallOfFameResponse> response = hallOfFameService.list(type, status, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame loaded", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HallOfFameResponse>> get(@PathVariable("id") UUID id,
                                                               @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFameResponse response = hallOfFameService.get(id, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame entry loaded", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HallOfFameResponse>> apply(@Valid @RequestBody HallOfFameApplyRequest request,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFameResponse response = hallOfFameService.apply(request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame application submitted", response));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<HallOfFameResponse>> review(@PathVariable("id") UUID id,
                                                                  @Valid @RequestBody HallOfFameDecisionRequest request,
                                                                  @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFameResponse response = hallOfFameService.review(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Hall of Fame reviewed", response));
    }

    @PostMapping("/{id}/votes")
    public ResponseEntity<ApiResponse<HallOfFameResponse>> vote(@PathVariable("id") UUID id,
                                                                @Valid @RequestBody HallOfFameVoteRequest request,
                                                                @AuthenticationPrincipal UserPrincipal principal) {
        HallOfFameResponse response = hallOfFameService.vote(id, request, principal);
        return ResponseEntity.ok(ApiResponse.ok("Vote recorded", response));
    }
}
