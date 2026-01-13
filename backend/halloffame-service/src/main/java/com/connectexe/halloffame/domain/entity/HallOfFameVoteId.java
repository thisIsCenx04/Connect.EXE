package com.connectexe.halloffame.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class HallOfFameVoteId implements Serializable {
    @Column(name = "entry_id", nullable = false)
    private UUID entryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    public HallOfFameVoteId() {
    }

    public HallOfFameVoteId(UUID entryId, UUID userId) {
        this.entryId = entryId;
        this.userId = userId;
    }

    public UUID getEntryId() {
        return entryId;
    }

    public UUID getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        HallOfFameVoteId that = (HallOfFameVoteId) o;
        return Objects.equals(entryId, that.entryId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(entryId, userId);
    }
}
