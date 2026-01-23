package com.connectexe.auth.domain.entity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.auth.domain.enums.OauthProvider;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_oauth_accounts")
@Getter
@Setter
@NoArgsConstructor
public class UserOauthAccount {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OauthProvider provider;

    @Column(name = "provider_uid", nullable = false)
    private String providerUid;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

}
