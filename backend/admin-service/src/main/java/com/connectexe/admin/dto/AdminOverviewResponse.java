package com.connectexe.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewResponse {
    private long totalUsers;
    private long activeUsers;
    private long pendingKyc;
    private long pendingProjects;
    private long totalProjects;
    private long activeSubscriptions;
    private long totalAiRequests;
    private long aiRequestsLast30Days;
    private BigDecimal aiSpendLast30Days;
    private BigDecimal estimatedMonthlyRevenue;
}
