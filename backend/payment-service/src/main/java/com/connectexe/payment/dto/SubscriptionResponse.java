package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PlanCode;
import com.connectexe.payment.domain.enums.SubscriptionStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SubscriptionResponse {
    private UUID id;
    private PlanCode planCode;
    private SubscriptionStatus status;
    private PaymentProvider provider;
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;

    public SubscriptionResponse(UUID id,
                                PlanCode planCode,
                                SubscriptionStatus status,
                                PaymentProvider provider,
                                OffsetDateTime currentPeriodStart,
                                OffsetDateTime currentPeriodEnd) {
        this.id = id;
        this.planCode = planCode;
        this.status = status;
        this.provider = provider;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
    }

    public UUID getId() {
        return id;
    }

    public PlanCode getPlanCode() {
        return planCode;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public OffsetDateTime getCurrentPeriodStart() {
        return currentPeriodStart;
    }

    public OffsetDateTime getCurrentPeriodEnd() {
        return currentPeriodEnd;
    }
}
