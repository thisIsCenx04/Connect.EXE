package com.connectexe.payment.repository;

import com.connectexe.payment.domain.entity.Plan;
import com.connectexe.payment.domain.enums.PlanCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, PlanCode> {
}
