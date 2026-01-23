package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.InvestorKyc;
import com.connectexe.admin.domain.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvestorKycRepository extends JpaRepository<InvestorKyc, UUID> {
    Optional<InvestorKyc> findByUserId(UUID userId);

    List<InvestorKyc> findByStatus(VerificationStatus status);

    long countByStatus(VerificationStatus status);
}
