package com.connectexe.halloffame.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.halloffame.domain.entity.HallOfFamePost;
import com.connectexe.halloffame.domain.entity.HallOfFamePostLink;
import com.connectexe.halloffame.domain.entity.HallOfFamePostMedia;
import com.connectexe.halloffame.domain.entity.HallOfFamePostTag;
import com.connectexe.halloffame.domain.enums.HallOfFamePostStatus;
import com.connectexe.halloffame.domain.enums.HallOfFamePostType;
import com.connectexe.halloffame.dto.HallOfFamePostLinkResponse;
import com.connectexe.halloffame.dto.HallOfFamePostMediaResponse;
import com.connectexe.halloffame.dto.HallOfFamePostRequest;
import com.connectexe.halloffame.dto.HallOfFamePostResponse;
import com.connectexe.halloffame.repository.HallOfFamePostLinkRepository;
import com.connectexe.halloffame.repository.HallOfFamePostMediaRepository;
import com.connectexe.halloffame.repository.HallOfFamePostRepository;
import com.connectexe.halloffame.repository.HallOfFamePostTagRepository;
import com.connectexe.halloffame.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class HallOfFamePostService {

    private final HallOfFamePostRepository postRepository;
    private final HallOfFamePostTagRepository tagRepository;
    private final HallOfFamePostLinkRepository linkRepository;
    private final HallOfFamePostMediaRepository mediaRepository;

    public HallOfFamePostService(HallOfFamePostRepository postRepository,
                                 HallOfFamePostTagRepository tagRepository,
                                 HallOfFamePostLinkRepository linkRepository,
                                 HallOfFamePostMediaRepository mediaRepository) {
        this.postRepository = postRepository;
        this.tagRepository = tagRepository;
        this.linkRepository = linkRepository;
        this.mediaRepository = mediaRepository;
    }

    public List<HallOfFamePostResponse> list(HallOfFamePostType type,
                                             HallOfFamePostStatus status,
                                             UserPrincipal principal) {
        HallOfFamePostStatus effectiveStatus = status == null ? HallOfFamePostStatus.PUBLISHED : status;
        if (effectiveStatus != HallOfFamePostStatus.PUBLISHED && !isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admins only");
        }
        List<HallOfFamePost> posts = type == null
            ? postRepository.findByStatusOrderByPublishedAtDesc(effectiveStatus)
            : postRepository.findByTypeAndStatusOrderByPublishedAtDesc(type, effectiveStatus);
        return posts.stream().map(this::toResponse).toList();
    }

    public HallOfFamePostResponse get(UUID id, UserPrincipal principal) {
        HallOfFamePost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        if (post.getStatus() == HallOfFamePostStatus.PUBLISHED || isAdmin(principal)) {
            return toResponse(post);
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
    }

    public HallOfFamePostResponse create(HallOfFamePostRequest request, UserPrincipal principal) {
        requireAdmin(principal);
        HallOfFamePost post = new HallOfFamePost();
        apply(request, post, principal);
        HallOfFamePost saved = postRepository.save(post);
        replaceTags(saved.getId(), request.getTags());
        replaceLinks(saved.getId(), request.getLinks());
        replaceMedia(saved.getId(), request.getMedia());
        return toResponse(saved);
    }

    public HallOfFamePostResponse update(UUID id, HallOfFamePostRequest request, UserPrincipal principal) {
        requireAdmin(principal);
        HallOfFamePost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        apply(request, post, principal);
        HallOfFamePost saved = postRepository.save(post);
        if (request.getTags() != null) {
            replaceTags(saved.getId(), request.getTags());
        }
        if (request.getLinks() != null) {
            replaceLinks(saved.getId(), request.getLinks());
        }
        if (request.getMedia() != null) {
            replaceMedia(saved.getId(), request.getMedia());
        }
        return toResponse(saved);
    }

    public HallOfFamePostResponse publish(UUID id, UserPrincipal principal) {
        requireAdmin(principal);
        HallOfFamePost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        post.setStatus(HallOfFamePostStatus.PUBLISHED);
        if (post.getPublishedAt() == null) {
            post.setPublishedAt(OffsetDateTime.now());
        }
        return toResponse(postRepository.save(post));
    }

    public HallOfFamePostResponse archive(UUID id, UserPrincipal principal) {
        requireAdmin(principal);
        HallOfFamePost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        post.setStatus(HallOfFamePostStatus.ARCHIVED);
        return toResponse(postRepository.save(post));
    }

    public HallOfFamePostResponse convertFromProject(HallOfFamePostRequest request, UserPrincipal principal) {
        requireAdmin(principal);
        return create(request, principal);
    }

    private void apply(HallOfFamePostRequest request, HallOfFamePost post, UserPrincipal principal) {
        post.setType(request.getType());
        post.setSourceProjectId(request.getSourceProjectId());
        post.setTitle(request.getTitle());
        post.setSummary(request.getSummary());
        post.setBody(request.getBody());
        post.setCoverUrl(request.getCoverUrl());
        if (post.getCreatedBy() == null) {
            post.setCreatedBy(principal.getUserId());
        }
    }

    private HallOfFamePostResponse toResponse(HallOfFamePost post) {
        List<String> tags = tagRepository.findByPostId(post.getId()).stream()
            .map(HallOfFamePostTag::getTag)
            .toList();
        List<HallOfFamePostLinkResponse> links = linkRepository.findByPostIdOrderBySortOrderAsc(post.getId()).stream()
            .map(link -> new HallOfFamePostLinkResponse(
                link.getId(),
                link.getType(),
                link.getLabel(),
                link.getUrl(),
                link.getSortOrder()
            ))
            .toList();
        List<HallOfFamePostMediaResponse> media = mediaRepository.findByPostIdOrderBySortOrderAsc(post.getId()).stream()
            .map(item -> new HallOfFamePostMediaResponse(
                item.getId(),
                item.getFileUrl(),
                item.getRole(),
                item.getSortOrder()
            ))
            .toList();
        return new HallOfFamePostResponse(
            post.getId(),
            post.getType(),
            post.getSourceProjectId(),
            post.getTitle(),
            post.getSummary(),
            post.getBody(),
            post.getCoverUrl(),
            post.getStatus(),
            tags,
            links,
            media,
            post.getPublishedAt(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }

    private void replaceTags(UUID postId, List<String> tags) {
        tagRepository.deleteByPostId(postId);
        if (tags == null || tags.isEmpty()) {
            return;
        }
        List<HallOfFamePostTag> entities = tags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(tag -> new HallOfFamePostTag(postId, tag.trim()))
            .toList();
        tagRepository.saveAll(entities);
    }

    private void replaceLinks(UUID postId, List<com.connectexe.halloffame.dto.HallOfFamePostLinkRequest> links) {
        linkRepository.deleteByPostId(postId);
        if (links == null || links.isEmpty()) {
            return;
        }
        List<HallOfFamePostLink> entities = links.stream()
            .map(link -> {
                HallOfFamePostLink entity = new HallOfFamePostLink();
                entity.setPostId(postId);
                entity.setType(link.getType());
                entity.setLabel(link.getLabel());
                entity.setUrl(link.getUrl());
                entity.setSortOrder(link.getSortOrder() == null ? 0 : link.getSortOrder());
                return entity;
            })
            .toList();
        linkRepository.saveAll(entities);
    }

    private void replaceMedia(UUID postId, List<com.connectexe.halloffame.dto.HallOfFamePostMediaRequest> media) {
        mediaRepository.deleteByPostId(postId);
        if (media == null || media.isEmpty()) {
            return;
        }
        List<HallOfFamePostMedia> entities = media.stream()
            .map(item -> {
                HallOfFamePostMedia entity = new HallOfFamePostMedia();
                entity.setPostId(postId);
                entity.setFileUrl(item.getFileUrl());
                if (item.getRole() != null) {
                    entity.setRole(item.getRole());
                }
                entity.setSortOrder(item.getSortOrder() == null ? 0 : item.getSortOrder());
                return entity;
            })
            .toList();
        mediaRepository.saveAll(entities);
    }

    private void requireAdmin(UserPrincipal principal) {
        if (!isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admin only");
        }
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal != null && principal.getRoles().contains("ROLE_ADMIN");
    }
}
