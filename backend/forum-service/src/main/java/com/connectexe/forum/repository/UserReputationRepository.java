package com.connectexe.forum.repository;

import com.connectexe.forum.domain.entity.UserReputation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserReputationRepository extends JpaRepository<UserReputation, UUID> {
}
