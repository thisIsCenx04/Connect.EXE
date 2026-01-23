package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.connectexe.admin.domain.enums.PlanCode;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevenuePlanSummary {
    private PlanCode planCode;
    private long activeSubscriptions;
    private BigDecimal estimatedMonthlyRevenue;
}
