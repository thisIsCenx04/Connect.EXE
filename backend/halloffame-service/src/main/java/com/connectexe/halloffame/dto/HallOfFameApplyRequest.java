package com.connectexe.halloffame.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFameApplyRequest {
    @NotNull
    private HallOfFameType type;

    @NotNull
    private UUID referenceId;

}
