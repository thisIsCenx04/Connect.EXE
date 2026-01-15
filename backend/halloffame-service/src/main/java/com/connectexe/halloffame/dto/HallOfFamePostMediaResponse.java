package com.connectexe.halloffame.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameMediaRole;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostMediaResponse {
    private UUID id;
    private String fileUrl;
    private HallOfFameMediaRole role;
    private Integer sortOrder;

}
