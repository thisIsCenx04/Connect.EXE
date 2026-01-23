package com.connectexe.admin.dto;

import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ResourceType;
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
public class ResourceResponse {
    private UUID id;
    private String title;
    private String description;
    private ResourceType type;
    private String url;
    private List<String> tags;
    private ContentStatus status;
    private UUID createdBy;
    private OffsetDateTime createdAt;
}
