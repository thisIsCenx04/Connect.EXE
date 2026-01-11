package com.connectexe.auth.security;

import com.connectexe.auth.config.AuthFlowProperties;
import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.domain.entity.UserOauthAccount;
import com.connectexe.auth.domain.enums.OauthProvider;
import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.dto.AuthResponse;
import com.connectexe.auth.repository.UserOauthAccountRepository;
import com.connectexe.auth.repository.UserRepository;
import com.connectexe.auth.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final UserOauthAccountRepository userOauthAccountRepository;
    private final AuthService authService;
    private final AuthFlowProperties authFlowProperties;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                     UserOauthAccountRepository userOauthAccountRepository,
                                     AuthService authService,
                                     AuthFlowProperties authFlowProperties) {
        this.userRepository = userRepository;
        this.userOauthAccountRepository = userOauthAccountRepository;
        this.authService = authService;
        this.authFlowProperties = authFlowProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken tokenAuth)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid OAuth2 authentication");
            return;
        }

        OAuth2User oauthUser = tokenAuth.getPrincipal();
        String provider = tokenAuth.getAuthorizedClientRegistrationId();
        if (!"google".equalsIgnoreCase(provider)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unsupported OAuth provider");
            return;
        }

        String email = (String) oauthUser.getAttributes().get("email");
        String providerUid = (String) oauthUser.getAttributes().get("sub");
        String name = (String) oauthUser.getAttributes().getOrDefault("name", email);
        String picture = (String) oauthUser.getAttributes().get("picture");

        if (email == null || providerUid == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing OAuth user info");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        if (user.getId() == null) {
            user.setEmail(email);
            user.setFullName(name);
            user.setAvatarUrl(picture);
            user.setRole(UserRole.USER);
            user.setActive(true);
        }
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(OffsetDateTime.now());
        User savedUser = userRepository.save(user);

        userOauthAccountRepository.findByProviderAndProviderUid(OauthProvider.GOOGLE, providerUid)
            .orElseGet(() -> {
                UserOauthAccount account = new UserOauthAccount();
                account.setUserId(savedUser.getId());
                account.setProvider(OauthProvider.GOOGLE);
                account.setProviderUid(providerUid);
                return userOauthAccountRepository.save(account);
            });

        AuthResponse authResponse = authService.issueTokens(savedUser);

        String redirectBase = authFlowProperties.getFrontendBaseUrl();
        if (redirectBase == null || redirectBase.isBlank()) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Frontend base URL not configured");
            return;
        }
        String redirectUrl = redirectBase + "/oauth2/callback"
            + "?accessToken=" + encode(authResponse.getAccessToken())
            + "&refreshToken=" + encode(authResponse.getRefreshToken())
            + "&userId=" + encode(authResponse.getUser().getId().toString())
            + "&email=" + encode(authResponse.getUser().getEmail())
            + "&fullName=" + encode(authResponse.getUser().getFullName())
            + "&role=" + encode(authResponse.getUser().getRole().name())
            + "&verifiedStatus=" + encode(authResponse.getUser().getVerifiedStatus().name())
            + "&avatarUrl=" + encode(authResponse.getUser().getAvatarUrl() == null ? "" : authResponse.getUser().getAvatarUrl())
            + "&emailVerified=" + authResponse.getUser().isEmailVerified();

        response.sendRedirect(redirectUrl);
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
