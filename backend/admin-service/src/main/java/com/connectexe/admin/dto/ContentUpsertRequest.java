package com.connectexe.admin.dto;

import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ContentUpsertRequest {
    @NotNull
    private ContentType type;

    private ContentStatus status;

    @NotBlank
    private String title;

    private String slug;

    private String summary;

    private String body;

    private String coverUrl;

    private List<String> tags;

    private OffsetDateTime startAt;

    private OffsetDateTime endAt;

    private String location;

    private String externalUrl;
}
