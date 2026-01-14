package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFameEntry;
import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import com.connectexe.halloffame.domain.enums.HallOfFameType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HallOfFameEntryRepository extends JpaRepository<HallOfFameEntry, UUID> {
    boolean existsByTypeAndReferenceId(HallOfFameType type, UUID referenceId);

    List<HallOfFameEntry> findByStatusOrderByScoreDesc(HallOfFameStatus status);

    List<HallOfFameEntry> findByStatusAndTypeOrderByScoreDesc(HallOfFameStatus status, HallOfFameType type);
}
