package com.connectexe.user.repository;

import com.connectexe.user.domain.entity.InvestorKyc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvestorKycRepository extends JpaRepository<InvestorKyc, UUID> {
    Optional<InvestorKyc> findByUserId(UUID userId);
}