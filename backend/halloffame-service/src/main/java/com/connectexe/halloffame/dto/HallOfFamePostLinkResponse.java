package com.connectexe.halloffame.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFameLinkType;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostLinkResponse {
    private UUID id;
    private HallOfFameLinkType type;
    private String label;
    private String url;
    private Integer sortOrder;

}
