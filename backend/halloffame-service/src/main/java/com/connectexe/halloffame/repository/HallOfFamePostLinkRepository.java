package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFamePostLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallOfFamePostLinkRepository extends JpaRepository<HallOfFamePostLink, UUID> {
    List<HallOfFamePostLink> findByPostIdOrderBySortOrderAsc(UUID postId);
    void deleteByPostId(UUID postId);
}
