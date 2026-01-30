package com.connectexe.auth.service;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.domain.enums.UserRole;
import com.connectexe.auth.dto.AdminUserStatusRequest;
import com.connectexe.auth.dto.AdminUserSummary;
import com.connectexe.auth.repository.UserRepository;
import com.connectexe.common.exception.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserSummary> listUsers(String query, Boolean active) {
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        List<User> users;
        
        if (normalizedQuery == null) {
            if (active == null) {
                users = userRepository.findAll(sort);
            } else {
                users = userRepository.findByActive(active, sort);
            }
        } else if (active == null) {
            users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                normalizedQuery,
                normalizedQuery,
                sort
            );
        } else {
            // Search with active filter - need to filter manually
            users = userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                normalizedQuery,
                normalizedQuery,
                sort
            ).stream()
                .filter(u -> u.isActive() == active)
                .toList();
        }
        
        return users.stream()
            .map(this::toUserSummary)
            .toList();
    }

    public AdminUserSummary updateUserStatus(UUID userId, AdminUserStatusRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setActive(Boolean.TRUE.equals(request.getActive()));
        User saved = userRepository.save(user);
        return toUserSummary(saved);
    }

    public long countUsers() {
        return userRepository.count();
    }

    public long countActiveUsers() {
        return userRepository.countByActiveTrue();
    }

    public void assertAdmin(User requester) {
        if (requester == null || requester.getRole() != UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admin access required");
        }
    }

    private AdminUserSummary toUserSummary(User user) {
        return new AdminUserSummary(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getVerifiedStatus(),
            user.isActive(),
            user.isEmailVerified(),
            user.getCreatedAt()
        );
    }
}
