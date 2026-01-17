package com.connectexe.forum.repository;

import com.connectexe.forum.domain.entity.ForumPost;
import com.connectexe.forum.domain.enums.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
    List<ForumPost> findByCategoryIdAndStatusOrderByCreatedAtDesc(UUID categoryId, PostStatus status);

    List<ForumPost> findByCategoryIdAndStatusOrderByUpvoteCountDesc(UUID categoryId, PostStatus status);

    List<ForumPost> findByStatusOrderByCreatedAtDesc(PostStatus status);

    List<ForumPost> findByStatusOrderByUpvoteCountDesc(PostStatus status);
}
