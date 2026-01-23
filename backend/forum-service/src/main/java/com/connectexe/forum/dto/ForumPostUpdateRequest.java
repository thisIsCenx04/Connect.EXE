package com.connectexe.forum.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.forum.domain.enums.PostStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostUpdateRequest {
    private String title;
    private String content;
    private PostStatus status;
}
