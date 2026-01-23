package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiUsageSummary {
    private UUID userId;
    private String email;
    private String fullName;
    private LocalDate day;
    private long totalRequests;
    private int promptTokens;
    private int completionTokens;
    private BigDecimal costUsd;
}
