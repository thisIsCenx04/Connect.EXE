package com.connectexe.project.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.project.domain.enums.ProjectMediaRole;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMediaResponse {
    private UUID id;
    private String fileUrl;
    private String fileType;
    private ProjectMediaRole role;
    private Integer sortOrder;
    private String caption;

}
