package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.Subscription;
import com.connectexe.admin.domain.enums.SubscriptionStatus;
import com.connectexe.admin.dto.PlanRevenueAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    long countByStatus(SubscriptionStatus status);

    @Query(value = """
        select s.plan_code as planCode,
               count(*) as activeCount,
               coalesce(sum(p.price_month_usd), 0) as revenue
          from subscriptions s
          join plans p on p.code = s.plan_code
         where s.status = 'ACTIVE'
         group by s.plan_code
         order by s.plan_code
        """, nativeQuery = true)
    List<PlanRevenueAggregate> findPlanRevenue();
}
