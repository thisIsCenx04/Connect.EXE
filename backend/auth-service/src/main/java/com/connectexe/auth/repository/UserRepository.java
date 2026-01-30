package com.connectexe.auth.repository;

import com.connectexe.auth.domain.entity.User;
import com.connectexe.auth.domain.enums.UserRole;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    
    // Admin queries
    List<User> findByActive(boolean active, Sort sort);
    List<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(String email, String fullName, Sort sort);
    List<User> findByEmailContainingIgnoreCaseAndActive(String email, boolean active, Sort sort);
    List<User> findByFullNameContainingIgnoreCaseAndActive(String fullName, boolean active, Sort sort);
    long countByActiveTrue();
}
