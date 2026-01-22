package com.connectexe.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface AiUsageAggregate {
    UUID getUserId();
    LocalDate getDay();
    Long getTotalRequests();
    Integer getPromptTokens();
    Integer getCompletionTokens();
    BigDecimal getCostUsd();
}
