package com.connectexe.auth.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
public class RefreshTokenStore {
    private static final String KEY_PREFIX = "auth:refresh:";

    private final StringRedisTemplate redisTemplate;

    public RefreshTokenStore(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void store(String refreshToken, String userId, Duration ttl) {
        redisTemplate.opsForValue().set(KEY_PREFIX + refreshToken, userId, ttl);
    }

    public Optional<String> getUserId(String refreshToken) {
        String value = redisTemplate.opsForValue().get(KEY_PREFIX + refreshToken);
        return Optional.ofNullable(value);
    }

    public void revoke(String refreshToken) {
        redisTemplate.delete(KEY_PREFIX + refreshToken);
    }
}
