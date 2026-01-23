package com.connectexe.forum.repository;

import com.connectexe.forum.domain.entity.ReputationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReputationEventRepository extends JpaRepository<ReputationEvent, UUID> {
}
