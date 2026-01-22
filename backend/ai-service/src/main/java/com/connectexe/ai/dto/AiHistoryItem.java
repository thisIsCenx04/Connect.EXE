package com.connectexe.ai.dto;

import com.connectexe.ai.domain.enums.AiAgentType;
import com.connectexe.ai.domain.enums.AiUsageStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AiHistoryItem {
    private UUID id;
    private AiAgentType agentType;
    private AiUsageStatus status;
    private String inputText;
    private String outputText;
    private String errorMessage;
    private Integer promptTokens;
    private Integer completionTokens;
    private BigDecimal costUsd;
    private OffsetDateTime createdAt;

    public AiHistoryItem(UUID id,
                         AiAgentType agentType,
                         AiUsageStatus status,
                         String inputText,
                         String outputText,
                         String errorMessage,
                         Integer promptTokens,
                         Integer completionTokens,
                         BigDecimal costUsd,
                         OffsetDateTime createdAt) {
        this.id = id;
        this.agentType = agentType;
        this.status = status;
        this.inputText = inputText;
        this.outputText = outputText;
        this.errorMessage = errorMessage;
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

    public AiUsageStatus getStatus() {
        return status;
    }

    public String getInputText() {
        return inputText;
    }

    public String getOutputText() {
        return outputText;
    }

    public String getErrorMessage() {
        return errorMessage;
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
