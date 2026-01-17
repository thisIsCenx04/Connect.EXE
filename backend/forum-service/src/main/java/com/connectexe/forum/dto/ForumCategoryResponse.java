package com.connectexe.forum.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumCategoryResponse {
    private UUID id;
    private String name;
    private String slug;
    private int sortOrder;
}
