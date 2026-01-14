package com.connectexe.project.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.project.domain.enums.ProjectLinkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectLinkRequest {
    @NotNull
    private ProjectLinkType type;

    private String label;

    @NotBlank
    private String url;

    private Integer sortOrder;

}
