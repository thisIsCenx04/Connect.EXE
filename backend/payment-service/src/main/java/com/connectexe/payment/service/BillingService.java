package com.connectexe.payment.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.domain.entity.Plan;
import com.connectexe.payment.domain.entity.PlanEntitlement;
import com.connectexe.payment.domain.entity.Subscription;
import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PlanCode;
import com.connectexe.payment.domain.enums.SubscriptionStatus;
import com.connectexe.payment.dto.BillingSummaryResponse;
import com.connectexe.payment.dto.PlanEntitlementResponse;
import com.connectexe.payment.dto.PlanResponse;
import com.connectexe.payment.dto.SubscriptionResponse;
import com.connectexe.payment.repository.PlanEntitlementRepository;
import com.connectexe.payment.repository.PlanRepository;
import com.connectexe.payment.repository.SubscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final PlanRepository planRepository;
    private final PlanEntitlementRepository planEntitlementRepository;
    private final SubscriptionRepository subscriptionRepository;

    public BillingService(PlanRepository planRepository,
                          PlanEntitlementRepository planEntitlementRepository,
                          SubscriptionRepository subscriptionRepository) {
        this.planRepository = planRepository;
        this.planEntitlementRepository = planEntitlementRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public List<PlanResponse> listPlans() {
        List<Plan> plans = planRepository.findAll();
        Map<PlanCode, List<PlanEntitlementResponse>> entitlementsByPlan = planEntitlementRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(
                entitlement -> entitlement.getId().getPlanCode(),
                Collectors.mapping(this::toEntitlementResponse, Collectors.toList())
            ));
        return plans.stream()
            .sorted(Comparator.comparing(Plan::getPriceMonthUsd))
            .map(plan -> new PlanResponse(
                plan.getCode(),
                plan.getName(),
                plan.getPriceMonthUsd(),
                entitlementsByPlan.getOrDefault(plan.getCode(), List.of())
            ))
            .toList();
    }

    public BillingSummaryResponse getBillingSummary(UUID userId) {
        Subscription subscription = getOrCreateSubscription(userId);
        Plan plan = planRepository.findById(subscription.getPlanCode())
            .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "PLAN_NOT_FOUND", "Plan not found"));
        List<PlanEntitlementResponse> entitlements = planEntitlementRepository.findByIdPlanCode(plan.getCode())
            .stream()
            .map(this::toEntitlementResponse)
            .toList();
        return new BillingSummaryResponse(
            toPlanResponse(plan, entitlements),
            toSubscriptionResponse(subscription),
            entitlements
        );
    }

    public BillingSummaryResponse changePlan(UUID userId, PlanCode planCode) {
        return changePlan(userId, planCode, null);
    }

    public BillingSummaryResponse changePlan(UUID userId, PlanCode planCode, Integer durationMonths) {
        Plan plan = planRepository.findById(planCode)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PLAN_NOT_FOUND", "Plan not found"));
        Subscription subscription = getOrCreateSubscription(userId);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        int resolvedMonths = resolveDurationMonths(durationMonths);
        subscription.setPlanCode(planCode);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setProvider(PaymentProvider.MANUAL);
        subscription.setCurrentPeriodStart(now);
        subscription.setCurrentPeriodEnd(now.plusMonths(resolvedMonths));
        subscriptionRepository.save(subscription);
        List<PlanEntitlementResponse> entitlements = planEntitlementRepository.findByIdPlanCode(plan.getCode())
            .stream()
            .map(this::toEntitlementResponse)
            .toList();
        return new BillingSummaryResponse(
            toPlanResponse(plan, entitlements),
            toSubscriptionResponse(subscription),
            entitlements
        );
    }

    public BillingSummaryResponse cancelPlan(UUID userId) {
        Subscription subscription = subscriptionRepository
            .findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "NO_ACTIVE_SUBSCRIPTION", "No active subscription"));
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCurrentPeriodEnd(now);
        subscriptionRepository.save(subscription);
        Plan plan = planRepository.findById(subscription.getPlanCode())
            .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "PLAN_NOT_FOUND", "Plan not found"));
        List<PlanEntitlementResponse> entitlements = planEntitlementRepository.findByIdPlanCode(plan.getCode())
            .stream()
            .map(this::toEntitlementResponse)
            .toList();
        return new BillingSummaryResponse(
            toPlanResponse(plan, entitlements),
            toSubscriptionResponse(subscription),
            entitlements
        );
    }

    public BillingSummaryResponse activatePaidSubscription(UUID userId,
                                                           PlanCode planCode,
                                                           Integer durationMonths,
                                                           PaymentProvider provider,
                                                           String providerSubId) {
        Plan plan = planRepository.findById(planCode)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "PLAN_NOT_FOUND", "Plan not found"));
        Subscription subscription = getOrCreateSubscription(userId);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        int resolvedMonths = resolveDurationMonths(durationMonths);
        subscription.setPlanCode(planCode);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setProvider(provider == null ? PaymentProvider.MANUAL : provider);
        subscription.setProviderSubId(providerSubId);
        subscription.setCurrentPeriodStart(now);
        subscription.setCurrentPeriodEnd(now.plusMonths(resolvedMonths));
        subscriptionRepository.save(subscription);
        List<PlanEntitlementResponse> entitlements = planEntitlementRepository.findByIdPlanCode(plan.getCode())
            .stream()
            .map(this::toEntitlementResponse)
            .toList();
        return new BillingSummaryResponse(
            toPlanResponse(plan, entitlements),
            toSubscriptionResponse(subscription),
            entitlements
        );
    }

    private Subscription getOrCreateSubscription(UUID userId) {
        return subscriptionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
            .orElseGet(() -> {
                Subscription subscription = new Subscription();
                subscription.setUserId(userId);
                subscription.setPlanCode(PlanCode.FREE);
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setCurrentPeriodStart(OffsetDateTime.now(ZoneOffset.UTC));
                subscription.setCurrentPeriodEnd(null);
                return subscriptionRepository.save(subscription);
            });
    }

    private int resolveDurationMonths(Integer durationMonths) {
        if (durationMonths == null) {
            return 1;
        }
        return switch (durationMonths) {
            case 1, 3, 6, 12 -> durationMonths;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Unsupported billing duration");
        };
    }

    private PlanEntitlementResponse toEntitlementResponse(PlanEntitlement entitlement) {
        return new PlanEntitlementResponse(entitlement.getId().getKey(), entitlement.getLimitValue());
    }

    private PlanResponse toPlanResponse(Plan plan, List<PlanEntitlementResponse> entitlements) {
        return new PlanResponse(plan.getCode(), plan.getName(), plan.getPriceMonthUsd(), entitlements);
    }

    private SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        return new SubscriptionResponse(
            subscription.getId(),
            subscription.getPlanCode(),
            subscription.getStatus(),
            subscription.getProvider(),
            subscription.getCurrentPeriodStart(),
            subscription.getCurrentPeriodEnd()
        );
    }
}
