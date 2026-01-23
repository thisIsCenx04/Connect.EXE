package com.connectexe.project.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.project.domain.enums.ProjectMemberRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberAddRequest {
    @NotNull
    private UUID userId;

    @NotNull
    private ProjectMemberRole role;

}
