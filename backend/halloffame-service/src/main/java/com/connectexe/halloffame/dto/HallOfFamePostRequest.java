package com.connectexe.halloffame.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFamePostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostRequest {
    @NotNull
    private HallOfFamePostType type;

    private UUID sourceProjectId;

    @NotBlank
    private String title;

    private String summary;

    @NotBlank
    private String body;

    private String coverUrl;

    private List<String> tags;

    private List<HallOfFamePostLinkRequest> links;

    private List<HallOfFamePostMediaRequest> media;

}
