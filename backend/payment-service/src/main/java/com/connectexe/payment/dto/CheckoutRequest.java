package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PlanCode;
import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {
    @NotNull(message = "Plan code is required")
    private PlanCode planCode;

    private Integer durationMonths;

    @NotNull(message = "Provider is required")
    private PaymentProvider provider;

    public PlanCode getPlanCode() {
        return planCode;
    }

    public void setPlanCode(PlanCode planCode) {
        this.planCode = planCode;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public void setProvider(PaymentProvider provider) {
        this.provider = provider;
    }
}
