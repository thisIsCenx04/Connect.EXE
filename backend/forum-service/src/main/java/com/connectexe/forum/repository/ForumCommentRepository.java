package com.connectexe.forum.repository;

import com.connectexe.forum.domain.entity.ForumComment;
import com.connectexe.forum.domain.enums.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {
    List<ForumComment> findByPostIdAndStatusOrderByCreatedAtAsc(UUID postId, PostStatus status);
}
