package com.connectexe.project.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.project.domain.enums.ProjectLinkType;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectLinkResponse {
    private UUID id;
    private ProjectLinkType type;
    private String label;
    private String url;
    private Integer sortOrder;

}
