package com.connectexe.auth.service;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.config.JwtProperties;
import com.connectexe.auth.dto.AuthResponse;
import com.connectexe.auth.dto.LoginRequest;
import com.connectexe.auth.dto.RefreshRequest;
import com.connectexe.auth.dto.RegisterRequest;
import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.repository.UserRepository;
import com.connectexe.auth.security.JwtService;
import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
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

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       RefreshTokenStore refreshTokenStore,
                       JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenStore = refreshTokenStore;
        this.jwtProperties = jwtProperties;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(UserRole.USER);
        user.setActive(true);
        User saved = userRepository.save(user);

        return issueTokens(saved);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid credentials"));

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

    private AuthResponse issueTokens(User user) {
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
            user.getRole()
        );

        return new AuthResponse(accessToken, refreshToken, summary);
    }
}
