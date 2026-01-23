package com.connectexe.payment.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.dto.BillingSummaryResponse;
import com.connectexe.payment.dto.ChangePlanRequest;
import com.connectexe.payment.dto.CheckoutRequest;
import com.connectexe.payment.dto.CheckoutResponse;
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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpServletRequest) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication required");
        }
        String clientIp = resolveClientIp(httpServletRequest);
        CheckoutResponse response = paymentService.createCheckout(
            principal.getUserId(),
            request.getPlanCode(),
            request.getDurationMonths(),
            request.getProvider(),
            clientIp
        );
        return ResponseEntity.ok(ApiResponse.ok("Checkout created", response));
    }

    @GetMapping("/vnpay/return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentService.PaymentResult result = paymentService.handleVnpayReturn(extractParams(request));
        response.sendRedirect(buildRedirectUrl(result));
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(HttpServletRequest request) {
        PaymentService.PaymentResult result = paymentService.handleVnpayIpn(extractParams(request));
        Map<String, String> body = new HashMap<>();
        body.put("RspCode", result.isSuccess() ? "00" : "99");
        body.put("Message", result.isSuccess() ? "Confirm Success" : result.getMessage());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/momo/return")
    public void momoReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentService.PaymentResult result = paymentService.handleMomoReturn(extractParams(request));
        response.sendRedirect(buildRedirectUrl(result));
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, String>> momoIpn(@RequestBody Map<String, Object> payload) {
        Map<String, String> params = payload.entrySet().stream()
            .collect(HashMap::new, (map, entry) -> map.put(entry.getKey(), entry.getValue() == null ? null : entry.getValue().toString()), HashMap::putAll);
        PaymentService.PaymentResult result = paymentService.handleMomoIpn(params);
        Map<String, String> body = new HashMap<>();
        body.put("resultCode", result.isSuccess() ? "0" : "99");
        body.put("message", result.isSuccess() ? "Success" : result.getMessage());
        return ResponseEntity.ok(body);
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }

    private String buildRedirectUrl(PaymentService.PaymentResult result) {
        String status = result.isSuccess() ? "success" : "failed";
        return String.format("%s/billing?payment=%s", requestBaseUrl(), status);
    }

    private String requestBaseUrl() {
        String baseUrl = System.getenv("FRONTEND_BASE_URL");
        if (baseUrl == null || baseUrl.isBlank()) {
            return "http://localhost:5173";
        }
        return baseUrl;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote == null || remote.isBlank() ? "127.0.0.1" : remote;
    }
}
