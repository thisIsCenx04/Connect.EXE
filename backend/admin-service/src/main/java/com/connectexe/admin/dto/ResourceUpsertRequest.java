package com.connectexe.admin.dto;

import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ResourceUpsertRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private ResourceType type;

    @NotBlank
    private String url;

    private List<String> tags;

    private ContentStatus status;
}
