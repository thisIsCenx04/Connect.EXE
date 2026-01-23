package com.connectexe.auth.domain.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "investor_preferences")
@Getter
@Setter
@NoArgsConstructor
public class InvestorPreference {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    private String industries;

    private String stages;

    @Column(name = "min_funding_usd", precision = 14, scale = 2)
    private BigDecimal minFundingUsd;

    @Column(name = "max_funding_usd", precision = 14, scale = 2)
    private BigDecimal maxFundingUsd;

    @Column(length = 2)
    private String country;

    @Column(length = 120)
    private String city;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
