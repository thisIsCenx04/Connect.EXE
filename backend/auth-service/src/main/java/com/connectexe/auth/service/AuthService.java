package com.connectexe.auth.service;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.config.AuthFlowProperties;
import com.connectexe.auth.config.JwtProperties;
import com.connectexe.auth.domain.entity.EmailVerificationToken;
import com.connectexe.auth.domain.entity.PasswordResetToken;
import com.connectexe.auth.dto.AuthResponse;
import com.connectexe.auth.dto.EmailVerificationRequest;
import com.connectexe.auth.dto.LoginRequest;
import com.connectexe.auth.dto.PasswordResetConfirmRequest;
import com.connectexe.auth.dto.PasswordResetRequest;
import com.connectexe.auth.dto.RefreshRequest;
import com.connectexe.auth.dto.RegisterRequest;
import com.connectexe.auth.dto.RegisterResponse;
import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.repository.EmailVerificationTokenRepository;
import com.connectexe.auth.repository.PasswordResetTokenRepository;
import com.connectexe.auth.repository.UserRepository;
import com.connectexe.auth.security.JwtService;
import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenStore refreshTokenStore;
    private final JwtProperties jwtProperties;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;
    private final AuthFlowProperties authFlowProperties;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       RefreshTokenStore refreshTokenStore,
                       JwtProperties jwtProperties,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       MailService mailService,
                       AuthFlowProperties authFlowProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenStore = refreshTokenStore;
        this.jwtProperties = jwtProperties;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailService = mailService;
        this.authFlowProperties = authFlowProperties;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(resolveRole(request));
        user.setActive(true);
        User saved = userRepository.save(user);

        EmailVerificationToken token = createEmailVerificationToken(saved.getId());
        sendVerificationEmail(saved.getEmail(), token.getToken());

        return new RegisterResponse(saved.getId(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials"));

        if (!user.isEmailVerified()) {
            EmailVerificationToken token = createEmailVerificationToken(user.getId());
            sendVerificationEmail(user.getEmail(), token.getToken());
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "EMAIL_NOT_VERIFIED",
                "Email not verified. We have resent the verification email. Please check and activate to log in."
            );
        }

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Invalid refresh token");
        }

        String userId = refreshTokenStore.getUserId(refreshToken)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "TOKEN_REVOKED", "Refresh token revoked"));

        User user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found"));

        refreshTokenStore.revoke(refreshToken);
        return issueTokens(user);
    }

    public AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(
            user.getId().toString(),
            user.getEmail(),
            List.of("ROLE_" + user.getRole().name())
        );
        String refreshToken = jwtService.generateRefreshToken(user.getId().toString());
        refreshTokenStore.store(
            refreshToken,
            user.getId().toString(),
            Duration.ofDays(jwtProperties.getRefreshTokenTtlDays())
        );

        AuthResponse.UserSummary summary = new AuthResponse.UserSummary(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getVerifiedStatus(),
            user.getAvatarUrl(),
            user.isEmailVerified()
        );

        return new AuthResponse(accessToken, refreshToken, summary);
    }

    private UserRole resolveRole(RegisterRequest request) {
        UserRole role = request.getRole() == null ? UserRole.USER : request.getRole();
        if (role != UserRole.USER
            && role != UserRole.FOUNDER
            && role != UserRole.INVESTOR
            && role != UserRole.MENTOR) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Role not allowed for self-registration");
        }
        return role;
    }

    public void verifyEmail(EmailVerificationRequest request) {
        String tokenValue = decodeValue(request.getToken());
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Invalid verification token"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Verification token expired");
        }

        User user = userRepository.findById(token.getUserId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(OffsetDateTime.now());
        userRepository.save(user);

        token.setUsedAt(OffsetDateTime.now());
        emailVerificationTokenRepository.save(token);
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            PasswordResetToken token = createPasswordResetToken(user.getId());
            sendPasswordResetEmail(user.getEmail(), token.getToken());
        });
    }

    public void resetPassword(PasswordResetConfirmRequest request) {
        String tokenValue = decodeValue(request.getToken());
        PasswordResetToken token = passwordResetTokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOKEN", "Invalid reset token"));
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "TOKEN_EXPIRED", "Reset token expired");
        }

        User user = userRepository.findById(token.getUserId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsedAt(OffsetDateTime.now());
        passwordResetTokenRepository.save(token);
    }

    private EmailVerificationToken createEmailVerificationToken(UUID userId) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUserId(userId);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(OffsetDateTime.now().plusMinutes(authFlowProperties.getVerificationTokenTtlMinutes()));
        return emailVerificationTokenRepository.save(token);
    }

    private PasswordResetToken createPasswordResetToken(UUID userId) {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(OffsetDateTime.now().plusMinutes(authFlowProperties.getResetTokenTtlMinutes()));
        return passwordResetTokenRepository.save(token);
    }

    private void sendVerificationEmail(String email, String token) {
        String baseUrl = authFlowProperties.getFrontendBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "CONFIG_ERROR", "Frontend base URL is not configured");
        }
        String link = baseUrl + "/verify-email?token=" + encodeValue(token);
        String body = "Welcome to Connect.EXE!\n\nPlease verify your email by clicking the link below:\n" + link
            + "\n\nThis link will expire in " + authFlowProperties.getVerificationTokenTtlMinutes() + " minutes.";
        mailService.sendEmail(email, "Verify your email", body);
    }

    private void sendPasswordResetEmail(String email, String token) {
        String baseUrl = authFlowProperties.getFrontendBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "CONFIG_ERROR", "Frontend base URL is not configured");
        }
        String link = baseUrl + "/reset-password?token=" + encodeValue(token);
        String body = "We received a request to reset your password.\n\nReset it using the link below:\n" + link
            + "\n\nThis link will expire in " + authFlowProperties.getResetTokenTtlMinutes() + " minutes.";
        mailService.sendEmail(email, "Reset your password", body);
    }

    private String encodeValue(String value) {
        return Base64.getUrlEncoder().encodeToString(value.getBytes());
    }

    private String decodeValue(String value) {
        try {
            return new String(Base64.getUrlDecoder().decode(value));
        } catch (IllegalArgumentException ex) {
            return value;
        }
    }
}
