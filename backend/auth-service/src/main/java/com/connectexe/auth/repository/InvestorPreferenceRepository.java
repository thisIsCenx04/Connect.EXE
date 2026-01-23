package com.connectexe.auth.repository;

import com.connectexe.auth.domain.entity.InvestorPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvestorPreferenceRepository extends JpaRepository<InvestorPreference, UUID> {
    Optional<InvestorPreference> findByUserId(UUID userId);
}
