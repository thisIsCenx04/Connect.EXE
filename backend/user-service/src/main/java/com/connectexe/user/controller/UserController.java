package com.connectexe.user.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.common.exception.ApiException;
import com.connectexe.user.domain.entity.User;
import com.connectexe.user.domain.enums.UserRole;
import com.connectexe.user.dto.ChangePasswordRequest;
import com.connectexe.user.dto.FileUploadResponse;
import com.connectexe.user.dto.KycResponse;
import com.connectexe.user.dto.KycReviewRequest;
import com.connectexe.user.dto.KycSubmitRequest;
import com.connectexe.user.dto.RoleUpgradeRequest;
import com.connectexe.user.dto.UserProfileResponse;
import com.connectexe.user.dto.UserProfileUpdateRequest;
import com.connectexe.user.service.CloudinaryService;
import com.connectexe.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;
    private final CloudinaryService cloudinaryService;

    public UserController(UserProfileService userProfileService, CloudinaryService cloudinaryService) {
        this.userProfileService = userProfileService;
        this.cloudinaryService = cloudinaryService;
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

    @PostMapping("/{id}/upgrade-role")
    public ResponseEntity<ApiResponse<UserProfileResponse>> upgradeRole(@PathVariable("id") UUID id,
                                                                        @Valid @RequestBody RoleUpgradeRequest request,
                                                                        @AuthenticationPrincipal User user) {
        UserProfileResponse profile = userProfileService.upgradeRole(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Role updated", profile));
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadAvatar(@PathVariable("id") UUID id,
                                                                        @RequestPart("file") MultipartFile file,
                                                                        @AuthenticationPrincipal User user) {
        userProfileService.assertSelfOrAdmin(id, user);
        CloudinaryService.UploadResult result = cloudinaryService.upload(file, "avatars");
        FileUploadResponse response = new FileUploadResponse(result.getUrl(), result.getPublicId());
        return ResponseEntity.ok(ApiResponse.ok("Avatar uploaded", response));
    }

    @PostMapping(value = "/{id}/kyc/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadKycDocument(@PathVariable("id") UUID id,
                                                                             @RequestPart("file") MultipartFile file,
                                                                             @AuthenticationPrincipal User user) {
        userProfileService.assertSelf(id, user);
        if (user.getRole() != UserRole.USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Only USER accounts can upload KYC documents");
        }
        CloudinaryService.UploadResult result = cloudinaryService.upload(file, "kyc-documents");
        FileUploadResponse response = new FileUploadResponse(result.getUrl(), result.getPublicId());
        return ResponseEntity.ok(ApiResponse.ok("KYC document uploaded", response));
    }
}
