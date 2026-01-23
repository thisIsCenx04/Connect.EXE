package com.connectexe.ai.repository;

import com.connectexe.ai.domain.entity.AiOutput;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiOutputRepository extends JpaRepository<AiOutput, UUID> {
}
