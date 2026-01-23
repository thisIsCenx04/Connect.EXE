package com.connectexe.halloffame.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameLinkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostLinkRequest {
    @NotNull
    private HallOfFameLinkType type;

    private String label;

    @NotBlank
    private String url;

    private Integer sortOrder;

}
