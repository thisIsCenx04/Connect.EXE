package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.AiRequest;
import com.connectexe.admin.dto.AiUsageAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AiRequestRepository extends JpaRepository<AiRequest, UUID> {

    long countByCreatedAtAfter(OffsetDateTime since);

    @Query(value = """
        select r.user_id as userId,
               date_trunc('day', r.created_at)::date as day,
               count(*) as totalRequests,
               coalesce(sum(r.prompt_tokens), 0) as promptTokens,
               coalesce(sum(r.completion_tokens), 0) as completionTokens,
               coalesce(sum(r.cost_usd), 0) as costUsd
          from ai_requests r
         where r.created_at >= :since
         group by r.user_id, day
         order by day desc
        """, nativeQuery = true)
    List<AiUsageAggregate> findUsageSince(@Param("since") OffsetDateTime since);
}
