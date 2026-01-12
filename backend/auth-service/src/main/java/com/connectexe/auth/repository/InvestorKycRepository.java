package com.connectexe.auth.repository;

import com.connectexe.auth.domain.entity.InvestorKyc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvestorKycRepository extends JpaRepository<InvestorKyc, UUID> {
    Optional<InvestorKyc> findByUserId(UUID userId);
}
