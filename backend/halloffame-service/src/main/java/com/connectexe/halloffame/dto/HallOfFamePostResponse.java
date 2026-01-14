package com.connectexe.halloffame.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFamePostStatus;
import com.connectexe.halloffame.domain.enums.HallOfFamePostType;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HallOfFamePostResponse {
    private UUID id;
    private HallOfFamePostType type;
    private UUID sourceProjectId;
    private String title;
    private String summary;
    private String body;
    private String coverUrl;
    private HallOfFamePostStatus status;
    private List<String> tags;
    private List<HallOfFamePostLinkResponse> links;
    private List<HallOfFamePostMediaResponse> media;
    private OffsetDateTime publishedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
