package com.connectexe.project.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.project.domain.enums.ProjectMediaRole;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMediaRequest {
    @NotBlank
    private String fileUrl;

    private String fileType;

    private ProjectMediaRole role;

    private Integer sortOrder;

    private String caption;

}
