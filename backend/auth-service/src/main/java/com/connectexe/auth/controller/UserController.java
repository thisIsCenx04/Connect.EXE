package com.connectexe.auth.controller;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.dto.KycResponse;
import com.connectexe.auth.dto.KycReviewRequest;
import com.connectexe.auth.dto.KycSubmitRequest;
import com.connectexe.auth.dto.ChangePasswordRequest;
import com.connectexe.auth.dto.UserProfileResponse;
import com.connectexe.auth.dto.UserProfileUpdateRequest;
import com.connectexe.auth.service.UserProfileService;
import com.connectexe.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@PathVariable("id") UUID id,
                                                                       @AuthenticationPrincipal User user) {
        UserProfileResponse profile = userProfileService.getProfile(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Profile loaded", profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@PathVariable("id") UUID id,
                                                                          @Valid @RequestBody UserProfileUpdateRequest request,
                                                                          @AuthenticationPrincipal User user) {
        UserProfileResponse profile = userProfileService.updateProfile(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profile));
    }

    @PostMapping("/{id}/kyc")
    public ResponseEntity<ApiResponse<KycResponse>> submitKyc(@PathVariable("id") UUID id,
                                                              @Valid @RequestBody KycSubmitRequest request,
                                                              @AuthenticationPrincipal User user) {
        KycResponse response = userProfileService.submitKyc(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("KYC submitted", response));
    }

    @GetMapping("/{id}/kyc")
    public ResponseEntity<ApiResponse<KycResponse>> getKyc(@PathVariable("id") UUID id,
                                                          @AuthenticationPrincipal User user) {
        KycResponse response = userProfileService.getKyc(id, user);
        return ResponseEntity.ok(ApiResponse.ok("KYC loaded", response));
    }

    @PatchMapping("/{id}/kyc/review")
    public ResponseEntity<ApiResponse<KycResponse>> reviewKyc(@PathVariable("id") UUID id,
                                                              @Valid @RequestBody KycReviewRequest request,
                                                              @AuthenticationPrincipal User user) {
        KycResponse response = userProfileService.reviewKyc(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("KYC reviewed", response));
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable("id") UUID id,
                                                            @Valid @RequestBody ChangePasswordRequest request,
                                                            @AuthenticationPrincipal User user) {
        userProfileService.changePassword(id, request, user);
        return ResponseEntity.ok(ApiResponse.<Void>ok("Password updated", null));
    }
}
