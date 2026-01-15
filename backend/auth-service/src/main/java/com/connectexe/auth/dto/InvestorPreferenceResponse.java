package com.connectexe.auth.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record InvestorPreferenceResponse(
    UUID id,
    UUID userId,
    List<String> industries,
    List<String> stages,
    BigDecimal minFundingUsd,
    BigDecimal maxFundingUsd,
    String country,
    String city,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
