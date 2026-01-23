package com.connectexe.admin.service;

import com.connectexe.admin.domain.entity.ContentItem;
import com.connectexe.admin.domain.entity.ResourceItem;
import com.connectexe.admin.domain.entity.User;
import com.connectexe.admin.domain.enums.ContentStatus;
import com.connectexe.admin.domain.enums.ContentType;
import com.connectexe.admin.dto.ContentResponse;
import com.connectexe.admin.dto.ContentUpsertRequest;
import com.connectexe.admin.dto.ResourceResponse;
import com.connectexe.admin.dto.ResourceUpsertRequest;
import com.connectexe.admin.repository.ContentItemRepository;
import com.connectexe.admin.repository.ResourceItemRepository;
import com.connectexe.common.exception.ApiException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ContentService {

    private final ContentItemRepository contentItemRepository;
    private final ResourceItemRepository resourceItemRepository;

    public ContentService(ContentItemRepository contentItemRepository,
                          ResourceItemRepository resourceItemRepository) {
        this.contentItemRepository = contentItemRepository;
        this.resourceItemRepository = resourceItemRepository;
    }

    public List<ContentResponse> listPublicContent(ContentType type) {
        Sort sort = Sort.by(Sort.Direction.DESC, "publishedAt");
        List<ContentItem> items = type == null
            ? contentItemRepository.findByStatus(ContentStatus.PUBLISHED, sort)
            : contentItemRepository.findByTypeAndStatus(type, ContentStatus.PUBLISHED, sort);
        return items.stream().map(this::toContentResponse).toList();
    }

    public ContentResponse getPublicContent(UUID id) {
        ContentItem item = contentItemRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_NOT_FOUND", "Content not found"));
        if (item.getStatus() != ContentStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CONTENT_NOT_FOUND", "Content not found");
        }
        return toContentResponse(item);
    }

    public List<ContentResponse> listAdminContent(ContentType type, ContentStatus status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        List<ContentItem> items;
        if (status == null) {
            items = type == null
                ? contentItemRepository.findAll(sort)
                : contentItemRepository.findByType(type, sort);
        } else {
            items = type == null
                ? contentItemRepository.findByStatus(status, sort)
                : contentItemRepository.findByTypeAndStatus(type, status, sort);
        }
        return items.stream().map(this::toContentResponse).toList();
    }

    public ContentResponse createContent(ContentUpsertRequest request, User creator) {
        ContentItem item = new ContentItem();
        applyRequest(item, request);
        item.setCreatedBy(creator == null ? null : creator.getId());
        if (item.getStatus() == ContentStatus.PUBLISHED && item.getPublishedAt() == null) {
            item.setPublishedAt(OffsetDateTime.now());
        }
        ContentItem saved = contentItemRepository.save(item);
        return toContentResponse(saved);
    }

    public ContentResponse updateContent(UUID id, ContentUpsertRequest request) {
        ContentItem item = contentItemRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CONTENT_NOT_FOUND", "Content not found"));
        applyRequest(item, request);
        if (item.getStatus() == ContentStatus.PUBLISHED && item.getPublishedAt() == null) {
            item.setPublishedAt(OffsetDateTime.now());
        }
        ContentItem saved = contentItemRepository.save(item);
        return toContentResponse(saved);
    }

    public void deleteContent(UUID id) {
        if (!contentItemRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CONTENT_NOT_FOUND", "Content not found");
        }
        contentItemRepository.deleteById(id);
    }

    public List<ResourceResponse> listPublicResources() {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        return resourceItemRepository.findByStatus(ContentStatus.PUBLISHED, sort)
            .stream()
            .map(this::toResourceResponse)
            .toList();
    }

    public ResourceResponse getPublicResource(UUID id) {
        ResourceItem item = resourceItemRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Resource not found"));
        if (item.getStatus() != ContentStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Resource not found");
        }
        return toResourceResponse(item);
    }

    public List<ResourceResponse> listAdminResources(ContentStatus status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (status == null) {
            return resourceItemRepository.findAll(sort)
                .stream()
                .map(this::toResourceResponse)
                .toList();
        }
        return resourceItemRepository.findByStatus(status, sort)
            .stream()
            .map(this::toResourceResponse)
            .toList();
    }

    public ResourceResponse createResource(ResourceUpsertRequest request, User creator) {
        ResourceItem item = new ResourceItem();
        applyResourceRequest(item, request);
        item.setCreatedBy(creator == null ? null : creator.getId());
        ResourceItem saved = resourceItemRepository.save(item);
        return toResourceResponse(saved);
    }

    public ResourceResponse updateResource(UUID id, ResourceUpsertRequest request) {
        ResourceItem item = resourceItemRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Resource not found"));
        applyResourceRequest(item, request);
        ResourceItem saved = resourceItemRepository.save(item);
        return toResourceResponse(saved);
    }

    public void deleteResource(UUID id) {
        if (!resourceItemRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Resource not found");
        }
        resourceItemRepository.deleteById(id);
    }

    private void applyRequest(ContentItem item, ContentUpsertRequest request) {
        if (request.getType() != null) {
            item.setType(request.getType());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }
        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        if (request.getSlug() != null) {
            item.setSlug(request.getSlug());
        }
        item.setSummary(request.getSummary());
        item.setBody(request.getBody());
        item.setCoverUrl(request.getCoverUrl());
        item.setTags(request.getTags() == null ? null : request.getTags().toArray(String[]::new));
        item.setStartAt(request.getStartAt());
        item.setEndAt(request.getEndAt());
        item.setLocation(request.getLocation());
        item.setExternalUrl(request.getExternalUrl());
    }

    private void applyResourceRequest(ResourceItem item, ResourceUpsertRequest request) {
        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        item.setDescription(request.getDescription());
        if (request.getType() != null) {
            item.setType(request.getType());
        }
        if (request.getUrl() != null) {
            item.setUrl(request.getUrl());
        }
        item.setTags(request.getTags() == null ? null : request.getTags().toArray(String[]::new));
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }
    }

    private ContentResponse toContentResponse(ContentItem item) {
        List<String> tags = item.getTags() == null ? List.of() : Arrays.asList(item.getTags());
        return new ContentResponse(
            item.getId(),
            item.getType(),
            item.getStatus(),
            item.getTitle(),
            item.getSlug(),
            item.getSummary(),
            item.getBody(),
            item.getCoverUrl(),
            tags,
            item.getStartAt(),
            item.getEndAt(),
            item.getLocation(),
            item.getExternalUrl(),
            item.getCreatedBy(),
            item.getPublishedAt(),
            item.getCreatedAt()
        );
    }

    private ResourceResponse toResourceResponse(ResourceItem item) {
        List<String> tags = item.getTags() == null ? List.of() : Arrays.asList(item.getTags());
        return new ResourceResponse(
            item.getId(),
            item.getTitle(),
            item.getDescription(),
            item.getType(),
            item.getUrl(),
            tags,
            item.getStatus(),
            item.getCreatedBy(),
            item.getCreatedAt()
        );
    }
}
