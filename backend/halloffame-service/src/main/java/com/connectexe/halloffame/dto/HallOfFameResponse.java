package com.connectexe.halloffame.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameStatus;
import com.connectexe.halloffame.domain.enums.HallOfFameType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFameResponse {
    private UUID id;
    private HallOfFameType type;
    private UUID referenceId;
    private BigDecimal score;
    private HallOfFameStatus status;
    private Long ratingCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
