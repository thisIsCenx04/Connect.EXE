package com.connectexe.forum.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumCommentResponse {
    private UUID id;
    private UUID postId;
    private UUID parentId;
    private UUID authorId;
    private String content;
    private int authorReputation;
    private String authorLevel;
    private OffsetDateTime createdAt;
}
