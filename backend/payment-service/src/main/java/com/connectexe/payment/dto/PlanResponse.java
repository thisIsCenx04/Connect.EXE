package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.PlanCode;

import java.math.BigDecimal;
import java.util.List;

public class PlanResponse {
    private PlanCode code;
    private String name;
    private BigDecimal priceMonthUsd;
    private List<PlanEntitlementResponse> entitlements;

    public PlanResponse(PlanCode code, String name, BigDecimal priceMonthUsd, List<PlanEntitlementResponse> entitlements) {
        this.code = code;
        this.name = name;
        this.priceMonthUsd = priceMonthUsd;
        this.entitlements = entitlements;
    }

    public PlanCode getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPriceMonthUsd() {
        return priceMonthUsd;
    }

    public List<PlanEntitlementResponse> getEntitlements() {
        return entitlements;
    }
}
