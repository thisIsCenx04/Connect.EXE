package com.connectexe.halloffame.domain.entity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "hall_of_fame_post_tags")
@IdClass(HallOfFamePostTag.HallOfFamePostTagId.class)
@Getter
@Setter
@NoArgsConstructor
public class HallOfFamePostTag {
    @Id
    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Id
    @Column(name = "tag", nullable = false, length = 50)
    private String tag;

    public HallOfFamePostTag(UUID postId, String tag) {
        this.postId = postId;
        this.tag = tag;
    }

    public static class HallOfFamePostTagId implements Serializable {
        private UUID postId;
        private String tag;

        public HallOfFamePostTagId() {}

        public HallOfFamePostTagId(UUID postId, String tag) {
            this.postId = postId;
            this.tag = tag;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (o == null || getClass() != o.getClass()) {
                return false;
            }
            HallOfFamePostTagId that = (HallOfFamePostTagId) o;
            return Objects.equals(postId, that.postId) && Objects.equals(tag, that.tag);
        }

        @Override
        public int hashCode() {
            return Objects.hash(postId, tag);
        }
    }
}
