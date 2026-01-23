package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFamePostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallOfFamePostMediaRepository extends JpaRepository<HallOfFamePostMedia, UUID> {
    List<HallOfFamePostMedia> findByPostIdOrderBySortOrderAsc(UUID postId);
    void deleteByPostId(UUID postId);
}
