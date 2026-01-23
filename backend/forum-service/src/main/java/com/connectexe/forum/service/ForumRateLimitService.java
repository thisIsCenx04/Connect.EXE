package com.connectexe.forum.service;

import com.connectexe.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ForumRateLimitService {

    private static final Duration COMMENT_INTERVAL = Duration.ofSeconds(3);
    private static final Duration VOTE_INTERVAL = Duration.ofMillis(0);
    private static final Duration POST_INTERVAL = Duration.ofMinutes(5);

    private final Map<UUID, Instant> lastCommentAt = new ConcurrentHashMap<>();
    private final Map<UUID, Instant> lastVoteAt = new ConcurrentHashMap<>();
    private final Map<UUID, Instant> lastPostAt = new ConcurrentHashMap<>();

    public void checkComment(UUID userId) {
        check(userId, lastCommentAt, COMMENT_INTERVAL, "COMMENT_RATE_LIMIT");
    }

    public void checkVote(UUID userId) {
        check(userId, lastVoteAt, VOTE_INTERVAL, "VOTE_RATE_LIMIT");
    }

    public void checkPost(UUID userId) {
        check(userId, lastPostAt, POST_INTERVAL, "POST_RATE_LIMIT");
    }

    private void check(UUID userId, Map<UUID, Instant> store, Duration interval, String code) {
        Instant now = Instant.now();
        Instant last = store.get(userId);
        if (last != null && Duration.between(last, now).compareTo(interval) < 0) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, code, "Please slow down");
        }
        store.put(userId, now);
    }
}
