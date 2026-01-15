package com.connectexe.auth.dto;

import java.math.BigDecimal;
import java.util.List;

public record InvestorPreferenceRequest(
    List<String> industries,
    List<String> stages,
    BigDecimal minFundingUsd,
    BigDecimal maxFundingUsd,
    String country,
    String city
) {}
