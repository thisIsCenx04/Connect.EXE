package com.connectexe.user.security;

import com.connectexe.user.domain.entity.User;
import com.connectexe.user.domain.enums.UserRole;
import com.connectexe.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository, EntityManager entityManager) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);
        if (StringUtils.hasText(token) && jwtService.isTokenValid(token)) {
            Claims claims = jwtService.parseClaims(token);
            UUID userId = UUID.fromString(claims.getSubject());
            String email = claims.get("email", String.class);
            String fullName = claims.get("fullName", String.class);
            String roleStr = claims.get("role", String.class);
            UserRole role = roleStr != null ? UserRole.valueOf(roleStr) : UserRole.USER;
            
            // Try to find user in user_db, if not found create a virtual user for authentication
            User user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                // Create a transient user object for authentication (not persisted)
                // The user will be created properly when they access their profile
                user = new User();
                user.setId(userId);
                user.setEmail(email);
                user.setFullName(fullName);
                user.setRole(role);
                user.setActive(true);
            }
            
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