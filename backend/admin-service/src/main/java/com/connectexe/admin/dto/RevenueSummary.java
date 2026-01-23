package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummary {
    private long activeSubscriptions;
    private BigDecimal estimatedMonthlyRevenue;
    private List<RevenuePlanSummary> planBreakdown;
}
