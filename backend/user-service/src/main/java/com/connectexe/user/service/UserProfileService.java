package com.connectexe.user.service;

import com.connectexe.user.domain.entity.InvestorKyc;
import com.connectexe.user.domain.entity.User;
import com.connectexe.user.domain.enums.UserRole;
import com.connectexe.user.domain.enums.VerificationStatus;
import com.connectexe.user.dto.KycResponse;
import com.connectexe.user.dto.KycReviewRequest;
import com.connectexe.user.dto.KycSubmitRequest;
import com.connectexe.user.dto.ChangePasswordRequest;
import com.connectexe.user.dto.RoleUpgradeRequest;
import com.connectexe.user.dto.UserProfileResponse;
import com.connectexe.user.dto.UserProfileUpdateRequest;
import com.connectexe.user.repository.InvestorKycRepository;
import com.connectexe.user.repository.UserRepository;
import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final InvestorKycRepository investorKycRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(UserRepository userRepository,
                              InvestorKycRepository investorKycRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.investorKycRepository = investorKycRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileResponse getProfile(UUID userId, User requester) {
        assertSelfOrAdmin(userId, requester);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(UUID userId, UserProfileUpdateRequest request, User requester) {
        assertSelfOrAdmin(userId, requester);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getHeadline() != null) {
            user.setHeadline(request.getHeadline());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    public KycResponse submitKyc(UUID userId, KycSubmitRequest request, User requester) {
        assertSelf(userId, requester);
        if (requester.getRole() != UserRole.USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Only USER accounts can submit KYC requests");
        }
        UserRole requestedRole = request.getRequestedRole();
        if (requestedRole == null
            || requestedRole == UserRole.USER
            || requestedRole == UserRole.GUEST
            || requestedRole == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Requested role is not allowed");
        }

        InvestorKyc kyc = investorKycRepository.findByUserId(userId)
            .orElseGet(InvestorKyc::new);

        if (kyc.getId() != null && kyc.getStatus() == VerificationStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "KYC_PENDING", "KYC request is pending");
        }

        kyc.setUserId(userId);
        kyc.setStatus(VerificationStatus.PENDING);
        kyc.setLegalName(request.getLegalName());
        kyc.setOrganization(request.getOrganization());
        kyc.setWebsite(request.getWebsite());
        kyc.setLinkedinUrl(request.getLinkedinUrl());
        kyc.setDocType(request.getDocType());
        kyc.setDocNumber(request.getDocNumber());
        kyc.setDocFileUrl(request.getDocFileUrl());
        kyc.setRequestedRole(requestedRole);
        kyc.setSubmittedAt(OffsetDateTime.now());
        kyc.setReviewedAt(null);
        kyc.setReviewedBy(null);
        kyc.setReviewNote(null);

        InvestorKyc saved = investorKycRepository.save(kyc);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setVerifiedStatus(VerificationStatus.PENDING);
        user.setVerifiedAt(null);
        userRepository.save(user);

        return toKycResponse(saved);
    }

    public KycResponse getKyc(UUID userId, User requester) {
        assertSelfOrAdmin(userId, requester);
        InvestorKyc kyc = investorKycRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "KYC_NOT_FOUND", "KYC not found"));
        return toKycResponse(kyc);
    }

    public KycResponse reviewKyc(UUID userId, KycReviewRequest request, User requester) {
        if (requester == null || requester.getRole() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can review KYC");
        }
        if (request.getStatus() == VerificationStatus.PENDING || request.getStatus() == VerificationStatus.NONE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Review status must be APPROVED or REJECTED");
        }

        InvestorKyc kyc = investorKycRepository.findByUserId(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "KYC_NOT_FOUND", "KYC not found"));
        kyc.setStatus(request.getStatus());
        kyc.setReviewNote(request.getReviewNote());
        kyc.setReviewedBy(requester.getId());
        kyc.setReviewedAt(OffsetDateTime.now());
        InvestorKyc saved = investorKycRepository.save(kyc);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setVerifiedStatus(request.getStatus());
        if (request.getStatus() == VerificationStatus.APPROVED) {
            if (kyc.getRequestedRole() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "REQUESTED_ROLE_MISSING", "Requested role is missing");
            }
            user.setRole(kyc.getRequestedRole());
            user.setVerifiedAt(OffsetDateTime.now());
        } else {
            user.setVerifiedAt(null);
        }
        userRepository.save(user);

        return toKycResponse(saved);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request, User requester) {
        assertSelf(userId, requester);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PASSWORD_NOT_SET", "Password not set for this account");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD", "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserProfileResponse upgradeRole(UUID userId, RoleUpgradeRequest request, User requester) {
        if (requester == null || requester.getRole() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only admins can update roles");
        }
        if (request.getRole() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_REQUIRED", "Role is required");
        }
        UserRole targetRole = request.getRole();
        if (targetRole == UserRole.ADMIN || targetRole == UserRole.GUEST || targetRole == UserRole.USER) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ROLE_NOT_ALLOWED", "Role upgrade is not allowed");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        if (user.getRole() == targetRole) {
            throw new ApiException(HttpStatus.CONFLICT, "ROLE_ALREADY_SET", "Role already assigned");
        }

        user.setRole(targetRole);
        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    public void assertSelfOrAdmin(UUID userId, User requester) {
        if (requester == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
        if (requester.getRole() != UserRole.ADMIN && !userId.equals(requester.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    public void assertSelf(UUID userId, User requester) {
        if (requester == null || !userId.equals(requester.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getAvatarUrl(),
            user.getRole(),
            user.getHeadline(),
            user.getBio(),
            user.getCountry(),
            user.getCity(),
            user.getVerifiedStatus(),
            user.getVerifiedAt(),
            user.isEmailVerified(),
            user.getEmailVerifiedAt(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    private KycResponse toKycResponse(InvestorKyc kyc) {
        return new KycResponse(
            kyc.getId(),
            kyc.getUserId(),
            kyc.getStatus(),
            kyc.getLegalName(),
            kyc.getOrganization(),
            kyc.getWebsite(),
            kyc.getLinkedinUrl(),
            kyc.getDocType(),
            kyc.getDocNumber(),
            kyc.getDocFileUrl(),
            kyc.getRequestedRole(),
            kyc.getSubmittedAt(),
            kyc.getReviewedBy(),
            kyc.getReviewedAt(),
            kyc.getReviewNote()
        );
    }
}
