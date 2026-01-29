package com.connectexe.payment.controller;

import com.connectexe.common.dto.ApiResponse;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.dto.PaymentOrderResponse;
import com.connectexe.payment.dto.PaymentOrderReviewRequest;
import com.connectexe.payment.service.PaymentAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    private final PaymentAdminService paymentAdminService;

    public AdminPaymentController(PaymentAdminService paymentAdminService) {
        this.paymentAdminService = paymentAdminService;
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentOrderResponse>>> listOrders(
            @RequestParam(value = "status", required = false) PaymentStatus status) {
        List<PaymentOrderResponse> orders = paymentAdminService.listOrders(status);
        return ResponseEntity.ok(ApiResponse.ok("Payment orders loaded", orders));
    }

    @PatchMapping("/orders/{orderCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> reviewOrder(
            @PathVariable("orderCode") String orderCode,
            @Valid @RequestBody PaymentOrderReviewRequest request) {
        PaymentOrderResponse updated = paymentAdminService.reviewOrder(orderCode, request.getAction(), request.getApplyTo());
        return ResponseEntity.ok(ApiResponse.ok("Payment order reviewed", updated));
    }
}
