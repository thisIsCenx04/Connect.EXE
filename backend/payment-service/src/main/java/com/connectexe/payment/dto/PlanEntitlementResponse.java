package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.EntitlementKey;

public class PlanEntitlementResponse {
    private EntitlementKey key;
    private Integer limitValue;

    public PlanEntitlementResponse(EntitlementKey key, Integer limitValue) {
        this.key = key;
        this.limitValue = limitValue;
    }

    public EntitlementKey getKey() {
        return key;
    }

    public Integer getLimitValue() {
        return limitValue;
    }
}
