package com.connectexe.halloffame.repository;

import com.connectexe.halloffame.domain.entity.HallOfFameVote;
import com.connectexe.halloffame.domain.entity.HallOfFameVoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface HallOfFameVoteRepository extends JpaRepository<HallOfFameVote, HallOfFameVoteId> {
    long countByIdEntryId(UUID entryId);

    @Query("select avg(v.value) from HallOfFameVote v where v.id.entryId = :entryId")
    Double averageForEntry(@Param("entryId") UUID entryId);
}
