package com.connectexe.halloffame.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFameDecisionRequest {
    @NotNull
    private HallOfFameStatus status;

}
