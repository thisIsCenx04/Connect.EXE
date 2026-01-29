package com.connectexe.payment.dto;

import com.connectexe.payment.domain.enums.PaymentApplyTarget;
import com.connectexe.payment.domain.enums.PaymentReviewAction;
import jakarta.validation.constraints.NotNull;

public class PaymentOrderReviewRequest {
    @NotNull(message = "Action is required")
    private PaymentReviewAction action;

    private PaymentApplyTarget applyTo;

    public PaymentReviewAction getAction() {
        return action;
    }

    public void setAction(PaymentReviewAction action) {
        this.action = action;
    }

    public PaymentApplyTarget getApplyTo() {
        return applyTo;
    }

    public void setApplyTo(PaymentApplyTarget applyTo) {
        this.applyTo = applyTo;
    }
}
