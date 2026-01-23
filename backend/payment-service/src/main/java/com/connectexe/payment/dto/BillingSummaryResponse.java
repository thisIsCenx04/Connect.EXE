package com.connectexe.payment.dto;

import java.util.List;

public class BillingSummaryResponse {
    private PlanResponse plan;
    private SubscriptionResponse subscription;
    private List<PlanEntitlementResponse> entitlements;

    public BillingSummaryResponse(PlanResponse plan,
                                  SubscriptionResponse subscription,
                                  List<PlanEntitlementResponse> entitlements) {
        this.plan = plan;
        this.subscription = subscription;
        this.entitlements = entitlements;
    }

    public PlanResponse getPlan() {
        return plan;
    }

    public SubscriptionResponse getSubscription() {
        return subscription;
    }

    public List<PlanEntitlementResponse> getEntitlements() {
        return entitlements;
    }
}
