package com.connectexe.ai.domain.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_outputs")
@Getter
@Setter
@NoArgsConstructor
public class AiOutput {

    @Id
    @Column(name = "request_id")
    private UUID requestId;

    @Column(name = "output_text")
    private String outputText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_json", columnDefinition = "jsonb")
    private JsonNode outputJson;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    public AiOutput(UUID requestId, String outputText, JsonNode outputJson) {
        this.requestId = requestId;
        this.outputText = outputText;
        this.outputJson = outputJson;
    }
}
