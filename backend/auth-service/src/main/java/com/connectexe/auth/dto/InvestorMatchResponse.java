package com.connectexe.auth.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record InvestorMatchResponse(
    UUID userId,
    String fullName,
    String headline,
    String avatarUrl,
    String country,
    String city,
    List<String> industries,
    List<String> stages,
    BigDecimal minFundingUsd,
    BigDecimal maxFundingUsd,
    int score
) {}
