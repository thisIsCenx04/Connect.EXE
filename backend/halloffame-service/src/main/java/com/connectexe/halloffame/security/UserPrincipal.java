package com.connectexe.halloffame.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class UserPrincipal {
    private final UUID userId;
    private final List<String> roles;

    public UserPrincipal(UUID userId, List<String> roles) {
        this.userId = userId;
        this.roles = roles;
    }

    public UUID getUserId() {
        return userId;
    }

    public List<String> getRoles() {
        return roles;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
    }
}
