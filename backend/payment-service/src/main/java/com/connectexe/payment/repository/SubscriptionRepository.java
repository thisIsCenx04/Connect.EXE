package com.connectexe.payment.repository;

import com.connectexe.payment.domain.entity.Subscription;
import com.connectexe.payment.domain.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Subscription> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, SubscriptionStatus status);
}
