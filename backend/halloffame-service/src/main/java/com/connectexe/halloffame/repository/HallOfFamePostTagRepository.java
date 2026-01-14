package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFamePostTag;
import com.connectexe.halloffame.domain.entity.HallOfFamePostTag.HallOfFamePostTagId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallOfFamePostTagRepository extends JpaRepository<HallOfFamePostTag, HallOfFamePostTagId> {
    List<HallOfFamePostTag> findByPostId(UUID postId);
    void deleteByPostId(UUID postId);
}
