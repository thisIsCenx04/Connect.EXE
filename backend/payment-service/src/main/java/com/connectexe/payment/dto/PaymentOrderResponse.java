package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.domain.enums.PlanCode;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PaymentOrderResponse {
    private UUID userId;
    private PlanCode planCode;
    private Integer durationMonths;
    private Long amountVnd;
    private PaymentProvider provider;
    private PaymentStatus status;
    private String orderCode;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public PaymentOrderResponse(UUID userId,
                                PlanCode planCode,
                                Integer durationMonths,
                                Long amountVnd,
                                PaymentProvider provider,
                                PaymentStatus status,
                                String orderCode,
                                OffsetDateTime createdAt,
                                OffsetDateTime updatedAt) {
        this.userId = userId;
        this.planCode = planCode;
        this.durationMonths = durationMonths;
        this.amountVnd = amountVnd;
        this.provider = provider;
        this.status = status;
        this.orderCode = orderCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getUserId() {
        return userId;
    }

    public PlanCode getPlanCode() {
        return planCode;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public Long getAmountVnd() {
        return amountVnd;
    }

    public PaymentProvider getProvider() {
        return provider;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
