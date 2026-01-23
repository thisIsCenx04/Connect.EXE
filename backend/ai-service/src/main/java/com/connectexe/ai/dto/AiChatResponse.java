package com.connectexe.ai.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AiChatResponse {
    private UUID id;
    private String reply;
    private Integer promptTokens;
    private Integer completionTokens;
    private BigDecimal costUsd;
    private OffsetDateTime createdAt;

    public AiChatResponse(UUID id,
                          String reply,
                          Integer promptTokens,
                          Integer completionTokens,
                          BigDecimal costUsd,
                          OffsetDateTime createdAt) {
        this.id = id;
        this.reply = reply;
        this.promptTokens = promptTokens;
        this.completionTokens = completionTokens;
        this.costUsd = costUsd;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getReply() {
        return reply;
    }

    public Integer getPromptTokens() {
        return promptTokens;
    }

    public Integer getCompletionTokens() {
        return completionTokens;
    }

    public BigDecimal getCostUsd() {
        return costUsd;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
