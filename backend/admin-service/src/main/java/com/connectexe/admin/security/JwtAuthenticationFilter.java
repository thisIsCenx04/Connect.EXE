package com.connectexe.admin.security;

import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.UserRole;
import com.connectexe.admin.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);
        if (StringUtils.hasText(token) && jwtService.isTokenValid(token)) {
            Claims claims = jwtService.parseClaims(token);
            UUID userId = UUID.fromString(claims.getSubject());
            
            // Try to find user in admin_db, if not found create transient user from JWT claims
            User user = userRepository.findById(userId).orElseGet(() -> {
                User transientUser = new User();
                transientUser.setId(userId);
                transientUser.setEmail(claims.get("email", String.class));
                transientUser.setFullName(claims.get("fullName", String.class));
                
                // Get role from JWT claims
                String roleStr = claims.get("role", String.class);
                if (roleStr == null) {
                    // Try to get from roles list
                    List<String> roles = claims.get("roles", List.class);
                    if (roles != null && !roles.isEmpty()) {
                        roleStr = roles.get(0).replace("ROLE_", "");
                    }
                }
                try {
                    transientUser.setRole(roleStr != null ? UserRole.valueOf(roleStr) : UserRole.USER);
                } catch (IllegalArgumentException e) {
                    transientUser.setRole(UserRole.USER);
                }
                transientUser.setActive(true);
                return transientUser;
            });
            
            setAuthentication(user, request);
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(User user, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
