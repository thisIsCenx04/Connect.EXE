package com.connectexe.halloffame.dto;

import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import jakarta.validation.constraints.NotNull;

public class HallOfFameDecisionRequest {
    @NotNull
    private HallOfFameStatus status;

    public HallOfFameStatus getStatus() {
        return status;
    }

    public void setStatus(HallOfFameStatus status) {
        this.status = status;
    }
}
