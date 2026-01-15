package com.connectexe.halloffame.domain.entity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import com.connectexe.halloffame.domain.enums.HallOfFamePostStatus;
import com.connectexe.halloffame.domain.enums.HallOfFamePostType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "hall_of_fame_posts")
@Getter
@Setter
@NoArgsConstructor
public class HallOfFamePost {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "hof_post_type")
    private HallOfFamePostType type;

    @Column(name = "source_project_id")
    private UUID sourceProjectId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column
    private String summary;

    @Column(nullable = false)
    private String body;

    @Column(name = "cover_url")
    private String coverUrl;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "hof_post_status")
    private HallOfFamePostStatus status = HallOfFamePostStatus.DRAFT;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime updatedAt;

}
