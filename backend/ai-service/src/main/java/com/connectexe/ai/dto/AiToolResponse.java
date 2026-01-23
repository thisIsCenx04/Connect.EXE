package com.connectexe.ai.dto;

import com.connectexe.ai.domain.enums.AiAgentType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AiToolResponse {
    private UUID id;
    private AiAgentType agentType;
    private String outputText;
    private String outputJson;
    private Integer promptTokens;
    private Integer completionTokens;
    private BigDecimal costUsd;
    private OffsetDateTime createdAt;

    public AiToolResponse(UUID id,
                          AiAgentType agentType,
                          String outputText,
                          String outputJson,
                          Integer promptTokens,
                          Integer completionTokens,
                          BigDecimal costUsd,
                          OffsetDateTime createdAt) {
        this.id = id;
        this.agentType = agentType;
        this.outputText = outputText;
        this.outputJson = outputJson;
        this.promptTokens = promptTokens;
        this.completionTokens = completionTokens;
        this.costUsd = costUsd;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public AiAgentType getAgentType() {
        return agentType;
    }

    public String getOutputText() {
        return outputText;
    }

    public String getOutputJson() {
        return outputJson;
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
