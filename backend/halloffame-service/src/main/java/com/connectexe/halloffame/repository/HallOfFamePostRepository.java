package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFamePost;
import com.connectexe.halloffame.domain.enums.HallOfFamePostStatus;
import com.connectexe.halloffame.domain.enums.HallOfFamePostType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallOfFamePostRepository extends JpaRepository<HallOfFamePost, UUID> {
    List<HallOfFamePost> findByTypeAndStatusOrderByPublishedAtDesc(HallOfFamePostType type, HallOfFamePostStatus status);
    List<HallOfFamePost> findByStatusOrderByPublishedAtDesc(HallOfFamePostStatus status);
}
