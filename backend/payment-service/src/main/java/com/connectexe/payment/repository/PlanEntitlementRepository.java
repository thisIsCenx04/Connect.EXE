package com.connectexe.payment.repository;

import com.connectexe.payment.domain.entity.PlanEntitlement;
import com.connectexe.payment.domain.entity.PlanEntitlementId;
import com.connectexe.payment.domain.enums.PlanCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanEntitlementRepository extends JpaRepository<PlanEntitlement, PlanEntitlementId> {
    List<PlanEntitlement> findByIdPlanCode(PlanCode planCode);
}
