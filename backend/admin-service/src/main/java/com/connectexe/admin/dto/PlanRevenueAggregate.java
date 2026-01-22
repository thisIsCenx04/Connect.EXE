package com.connectexe.admin.dto;

import java.math.BigDecimal;

public interface PlanRevenueAggregate {
    String getPlanCode();
    Long getActiveCount();
    BigDecimal getRevenue();
}
