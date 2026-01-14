package com.connectexe.halloffame.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "hall_of_fame_votes")
public class HallOfFameVote {
    @EmbeddedId
    private HallOfFameVoteId id;

    @MapsId("entryId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private HallOfFameEntry entry;

    @Column(nullable = false, columnDefinition = "smallint")
    private short value;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    public HallOfFameVoteId getId() {
        return id;
    }

    public void setId(HallOfFameVoteId id) {
        this.id = id;
    }

    public HallOfFameEntry getEntry() {
        return entry;
    }

    public void setEntry(HallOfFameEntry entry) {
        this.entry = entry;
    }

    public short getValue() {
        return value;
    }

    public void setValue(short value) {
        this.value = value;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
