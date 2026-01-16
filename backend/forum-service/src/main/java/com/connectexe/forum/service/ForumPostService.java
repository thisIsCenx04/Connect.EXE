package com.connectexe.forum.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.forum.domain.entity.ForumCategory;
import com.connectexe.forum.domain.entity.ForumComment;
import com.connectexe.forum.domain.entity.ForumPost;
import com.connectexe.forum.domain.entity.ForumVote;
import com.connectexe.forum.domain.entity.ForumVoteId;
import com.connectexe.forum.domain.entity.UserReputation;
import com.connectexe.forum.domain.enums.PostStatus;
import com.connectexe.forum.domain.enums.VoteType;
import com.connectexe.forum.dto.ForumCommentRequest;
import com.connectexe.forum.dto.ForumCommentResponse;
import com.connectexe.forum.dto.ForumPostCreateRequest;
import com.connectexe.forum.dto.ForumPostResponse;
import com.connectexe.forum.dto.ForumPostUpdateRequest;
import com.connectexe.forum.dto.ForumVoteRequest;
import com.connectexe.forum.repository.ForumCategoryRepository;
import com.connectexe.forum.repository.ForumCommentRepository;
import com.connectexe.forum.repository.ForumPostRepository;
import com.connectexe.forum.repository.ForumVoteRepository;
import com.connectexe.forum.repository.UserReputationRepository;
import com.connectexe.forum.security.UserPrincipal;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ForumPostService {

    private final ForumPostRepository postRepository;
    private final ForumCategoryRepository categoryRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumVoteRepository voteRepository;
    private final UserReputationRepository reputationRepository;
    private final ForumCategoryService categoryService;
    private final ForumRealtimeService realtimeService;
    private final ForumRateLimitService rateLimitService;

    public ForumPostService(ForumPostRepository postRepository,
                            ForumCategoryRepository categoryRepository,
                            ForumCommentRepository commentRepository,
                            ForumVoteRepository voteRepository,
                            UserReputationRepository reputationRepository,
                            ForumCategoryService categoryService,
                            ForumRealtimeService realtimeService,
                            ForumRateLimitService rateLimitService) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.commentRepository = commentRepository;
        this.voteRepository = voteRepository;
        this.reputationRepository = reputationRepository;
        this.categoryService = categoryService;
        this.realtimeService = realtimeService;
        this.rateLimitService = rateLimitService;
    }

    public List<ForumPostResponse> list(UUID categoryId, String categorySlug, String sort, PostStatus status,
                                        UserPrincipal principal) {
        PostStatus effectiveStatus = status == null ? PostStatus.PUBLISHED : status;
        if (effectiveStatus != PostStatus.PUBLISHED && !isAdmin(principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admins only");
        }
        UUID resolvedCategoryId = resolveCategoryId(categoryId, categorySlug);
        List<ForumPost> posts = fetchPosts(resolvedCategoryId, sort, effectiveStatus);
        Map<UUID, ForumCategory> categories = categoryRepository.findAllById(
            posts.stream().map(ForumPost::getCategoryId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(ForumCategory::getId, category -> category));
        return posts.stream()
            .map(post -> toResponse(post, categories.get(post.getCategoryId())))
            .toList();
    }

    public ForumPostResponse get(UUID id, UserPrincipal principal) {
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        if (post.getStatus() != PostStatus.PUBLISHED && !isOwnerOrAdmin(post, principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
        ForumCategory category = categoryService.resolveById(post.getCategoryId());
        return toResponse(post, category);
    }

    @Transactional
    public ForumPostResponse create(ForumPostCreateRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        rateLimitService.checkPost(principal.getUserId());
        ForumCategory category = categoryService.resolveById(request.getCategoryId());
        if (category == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found");
        }
        ForumPost post = new ForumPost();
        post.setCategoryId(category.getId());
        post.setAuthorId(principal.getUserId());
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setStatus(PostStatus.PUBLISHED);
        ForumPost saved = postRepository.save(post);
        return toResponse(saved, category);
    }

    @Transactional
    public ForumPostResponse update(UUID id, ForumPostUpdateRequest request, UserPrincipal principal) {
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        requireOwnerOrAdmin(post, principal);

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getStatus() != null) {
            if (!isAdmin(principal)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admins only");
            }
            post.setStatus(request.getStatus());
        }

        ForumPost saved = postRepository.save(post);
        ForumCategory category = categoryService.resolveById(saved.getCategoryId());
        return toResponse(saved, category);
    }

    @Transactional
    public void delete(UUID id, UserPrincipal principal) {
        ForumPost post = postRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        requireOwnerOrAdmin(post, principal);
        postRepository.delete(post);
    }

    public List<ForumCommentResponse> listComments(UUID postId) {
        List<ForumComment> comments = commentRepository.findByPostIdAndStatusOrderByCreatedAtAsc(
            postId, PostStatus.PUBLISHED);
        return comments.stream().map(this::toCommentResponse).toList();
    }

    @Transactional
    public ForumCommentResponse addComment(UUID postId, ForumCommentRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        rateLimitService.checkComment(principal.getUserId());
        ForumPost post = postRepository.findById(postId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "POST_NOT_PUBLISHED", "Post not published");
        }
        ForumComment comment = new ForumComment();
        comment.setPostId(postId);
        comment.setAuthorId(principal.getUserId());
        comment.setParentId(request.getParentId());
        comment.setContent(request.getContent());
        comment.setStatus(PostStatus.PUBLISHED);
        ForumComment saved = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);
        ForumCommentResponse response = toCommentResponse(saved);
        realtimeService.publish(postId, "comment", response);
        return response;
    }

    @Transactional
    public ForumPostResponse vote(UUID postId, ForumVoteRequest request, UserPrincipal principal) {
        requireAuthenticated(principal);
        rateLimitService.checkVote(principal.getUserId());
        ForumPost post = postRepository.findById(postId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "Post not found"));
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "POST_NOT_PUBLISHED", "Post not published");
        }
        VoteType incoming = request.getVote();
        ForumVoteId voteId = new ForumVoteId(postId, principal.getUserId());
        ForumVote existing = voteRepository.findById(voteId).orElse(null);
        if (existing == null) {
            ForumVote vote = new ForumVote();
            vote.setId(voteId);
            vote.setVote(incoming);
            voteRepository.save(vote);
            applyVoteDelta(post, incoming, 1);
        } else if (existing.getVote() == incoming) {
            voteRepository.delete(existing);
            applyVoteDelta(post, incoming, -1);
        } else {
            applyVoteDelta(post, existing.getVote(), -1);
            applyVoteDelta(post, incoming, 1);
            existing.setVote(incoming);
            voteRepository.save(existing);
        }
        ForumPost saved = postRepository.save(post);
        ForumCategory category = categoryService.resolveById(saved.getCategoryId());
        ForumPostResponse response = toResponse(saved, category);
        realtimeService.publish(postId, "vote", response);
        return response;
    }

    private void applyVoteDelta(ForumPost post, VoteType vote, int delta) {
        if (vote == VoteType.UP) {
            post.setUpvoteCount(Math.max(0, post.getUpvoteCount() + delta));
        } else {
            post.setDownvoteCount(Math.max(0, post.getDownvoteCount() + delta));
        }
    }

    private List<ForumPost> fetchPosts(UUID categoryId, String sort, PostStatus status) {
        boolean sortByTop = sort != null && sort.equalsIgnoreCase("TOP");
        if (categoryId != null) {
            return sortByTop
                ? postRepository.findByCategoryIdAndStatusOrderByUpvoteCountDesc(categoryId, status)
                : postRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, status);
        }
        return sortByTop
            ? postRepository.findByStatusOrderByUpvoteCountDesc(status)
            : postRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    private UUID resolveCategoryId(UUID categoryId, String categorySlug) {
        if (categoryId != null) {
            return categoryId;
        }
        if (categorySlug == null || categorySlug.isBlank()) {
            return null;
        }
        ForumCategory category = categoryService.resolveBySlug(categorySlug);
        if (category == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found");
        }
        return category.getId();
    }

    private ForumPostResponse toResponse(ForumPost post, ForumCategory category) {
        UserReputation reputation = reputationRepository.findById(post.getAuthorId()).orElse(null);
        int points = reputation == null ? 0 : reputation.getPoints();
        String level = reputation == null ? "NEWBIE" : reputation.getLevel();
        String categoryName = category == null ? null : category.getName();
        String categorySlug = category == null ? null : category.getSlug();
        return new ForumPostResponse(
            post.getId(),
            post.getCategoryId(),
            categoryName,
            categorySlug,
            post.getTitle(),
            post.getContent(),
            post.getStatus(),
            post.getUpvoteCount(),
            post.getDownvoteCount(),
            post.getCommentCount(),
            post.getAuthorId(),
            points,
            level,
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }

    private ForumCommentResponse toCommentResponse(ForumComment comment) {
        UserReputation reputation = reputationRepository.findById(comment.getAuthorId()).orElse(null);
        int points = reputation == null ? 0 : reputation.getPoints();
        String level = reputation == null ? "NEWBIE" : reputation.getLevel();
        return new ForumCommentResponse(
            comment.getId(),
            comment.getPostId(),
            comment.getParentId(),
            comment.getAuthorId(),
            comment.getContent(),
            points,
            level,
            comment.getCreatedAt()
        );
    }

    private void requireAuthenticated(UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
    }

    private void requireOwnerOrAdmin(ForumPost post, UserPrincipal principal) {
        if (!isOwnerOrAdmin(post, principal)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed");
        }
    }

    private boolean isOwnerOrAdmin(ForumPost post, UserPrincipal principal) {
        if (principal == null) {
            return false;
        }
        if (principal.getRoles().contains("ROLE_ADMIN")) {
            return true;
        }
        return post.getAuthorId().equals(principal.getUserId());
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal != null && principal.getRoles().contains("ROLE_ADMIN");
    }
}
