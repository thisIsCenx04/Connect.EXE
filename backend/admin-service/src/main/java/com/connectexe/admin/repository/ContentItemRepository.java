package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.ContentItem;
import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ContentType;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {
    List<ContentItem> findByTypeAndStatus(ContentType type, ContentStatus status, Sort sort);
    List<ContentItem> findByType(ContentType type, Sort sort);
    List<ContentItem> findByStatus(ContentStatus status, Sort sort);
    Optional<ContentItem> findBySlug(String slug);
}
