package com.connectexe.payment.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.dto.BillingSummaryResponse;
import com.connectexe.payment.dto.ChangePlanRequest;
import com.connectexe.payment.dto.CheckoutRequest;
import com.connectexe.payment.dto.CheckoutResponse;
import com.connectexe.payment.dto.ManualPaymentInfoResponse;
import com.connectexe.payment.dto.PlanResponse;
import com.connectexe.payment.security.UserPrincipal;
import com.connectexe.payment.service.BillingService;
import com.connectexe.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;
    private final PaymentService paymentService;

    public BillingController(BillingService billingService, PaymentService paymentService) {
        this.billingService = billingService;
        this.paymentService = paymentService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> listPlans() {
        List<PlanResponse> plans = billingService.listPlans();
        return ResponseEntity.ok(ApiResponse.ok("Plans loaded", plans));
    }

    @GetMapping("/subscription")
    public ResponseEntity<ApiResponse<BillingSummaryResponse>> getSubscription(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        BillingSummaryResponse summary = billingService.getBillingSummary(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Subscription loaded", summary));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<BillingSummaryResponse>> subscribe(
            @Valid @RequestBody ChangePlanRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        BillingSummaryResponse summary = billingService.changePlan(
            principal.getUserId(),
            request.getPlanCode(),
            request.getDurationMonths()
        );
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated", summary));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<BillingSummaryResponse>> cancel(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        BillingSummaryResponse summary = billingService.cancelPlan(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("Subscription cancelled", summary));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        CheckoutResponse response = paymentService.createCheckout(
            principal.getUserId(),
            request.getPlanCode(),
            request.getDurationMonths()
        );
        return ResponseEntity.ok(ApiResponse.ok("Checkout created", response));
    }

    @GetMapping("/manual/info")
    public ResponseEntity<ApiResponse<ManualPaymentInfoResponse>> manualInfo() {
        ManualPaymentInfoResponse info = paymentService.getManualPaymentInfo();
        return ResponseEntity.ok(ApiResponse.ok("Manual payment info loaded", info));
    }
}
