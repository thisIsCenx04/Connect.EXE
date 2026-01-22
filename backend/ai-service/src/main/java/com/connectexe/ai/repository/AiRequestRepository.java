package com.connectexe.ai.repository;

import com.connectexe.ai.domain.entity.AiRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import com.connectexe.ai.domain.enums.AiAgentType;

public interface AiRequestRepository extends JpaRepository<AiRequest, UUID> {
    List<AiRequest> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    List<AiRequest> findByUserIdAndAgentTypeOrderByCreatedAtDesc(UUID userId, AiAgentType agentType, Pageable pageable);
}
