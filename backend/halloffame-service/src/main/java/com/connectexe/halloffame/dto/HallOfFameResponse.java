package com.connectexe.halloffame.dto;

import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import com.connectexe.halloffame.domain.enums.HallOfFameType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class HallOfFameResponse {
    private UUID id;
    private HallOfFameType type;
    private UUID referenceId;
    private BigDecimal score;
    private HallOfFameStatus status;
    private Long ratingCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public HallOfFameResponse(UUID id,
                              HallOfFameType type,
                              UUID referenceId,
                              BigDecimal score,
                              HallOfFameStatus status,
                              Long ratingCount,
                              OffsetDateTime createdAt,
                              OffsetDateTime updatedAt) {
        this.id = id;
        this.type = type;
        this.referenceId = referenceId;
        this.score = score;
        this.status = status;
        this.ratingCount = ratingCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public HallOfFameType getType() {
        return type;
    }

    public UUID getReferenceId() {
        return referenceId;
    }

    public BigDecimal getScore() {
        return score;
    }

    public HallOfFameStatus getStatus() {
        return status;
    }

    public Long getRatingCount() {
        return ratingCount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
