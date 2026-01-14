package com.connectexe.halloffame.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameMediaRole;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostMediaRequest {
    @NotBlank
    private String fileUrl;

    private HallOfFameMediaRole role;

    private Integer sortOrder;

}
