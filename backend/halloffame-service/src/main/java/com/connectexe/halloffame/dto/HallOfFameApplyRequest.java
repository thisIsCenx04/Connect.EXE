package com.connectexe.halloffame.dto;

import com.connectexe.halloffame.domain.enums.HallOfFameType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class HallOfFameApplyRequest {
    @NotNull
    private HallOfFameType type;

    @NotNull
    private UUID referenceId;

    public HallOfFameType getType() {
        return type;
    }

    public void setType(HallOfFameType type) {
        this.type = type;
    }

    public UUID getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(UUID referenceId) {
        this.referenceId = referenceId;
    }
}
