package com.connectexe.project.domain.entity;
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
@Table(name = "project_tags")
@IdClass(ProjectTag.ProjectTagId.class)
@Getter
@Setter
@NoArgsConstructor
public class ProjectTag {
    @Id
    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Id
    @Column(name = "tag", nullable = false, length = 50)
    private String tag;

    public ProjectTag(UUID projectId, String tag) {
        this.projectId = projectId;
        this.tag = tag;
    }

    public static class ProjectTagId implements Serializable {
        private UUID projectId;
        private String tag;

        public ProjectTagId() {}

        public ProjectTagId(UUID projectId, String tag) {
            this.projectId = projectId;
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
            ProjectTagId that = (ProjectTagId) o;
            return Objects.equals(projectId, that.projectId) && Objects.equals(tag, that.tag);
        }

        @Override
        public int hashCode() {
            return Objects.hash(projectId, tag);
        }
    }
}
