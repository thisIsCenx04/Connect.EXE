package com.connectexe.admin.repository;

import com.connectexe.admin.domain.entity.ResourceItem;
import com.connectexe.admin.domain.enums.ContentStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceItemRepository extends JpaRepository<ResourceItem, UUID> {
    List<ResourceItem> findByStatus(ContentStatus status, Sort sort);
}
