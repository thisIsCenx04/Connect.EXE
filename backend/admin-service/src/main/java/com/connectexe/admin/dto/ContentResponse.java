package com.connectexe.admin.dto;

import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentResponse {
    private UUID id;
    private ContentType type;
    private ContentStatus status;
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
    private UUID createdBy;
    private OffsetDateTime publishedAt;
    private OffsetDateTime createdAt;
}
