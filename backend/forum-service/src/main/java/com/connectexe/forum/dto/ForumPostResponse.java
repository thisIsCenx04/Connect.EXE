package com.connectexe.forum.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.connectexe.forum.domain.enums.PostStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostResponse {
    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private String categorySlug;
    private String title;
    private String content;
    private PostStatus status;
    private int upvoteCount;
    private int downvoteCount;
    private int commentCount;
    private UUID authorId;
    private int authorReputation;
    private String authorLevel;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
