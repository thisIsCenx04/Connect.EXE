package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);

    long countByActiveTrue();

    List<User> findByActive(boolean active, Sort sort);

    List<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
        String email,
        String fullName,
        Sort sort
    );

    List<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseAndActive(
        String email,
        String fullName,
        boolean active,
        Sort sort
    );
}
