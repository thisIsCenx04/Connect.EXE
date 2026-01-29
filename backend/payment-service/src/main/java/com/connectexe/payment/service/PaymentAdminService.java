package com.connectexe.payment.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.domain.entity.PaymentOrder;
import com.connectexe.payment.domain.enums.PaymentApplyTarget;
import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PaymentReviewAction;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.dto.PaymentOrderResponse;
import com.connectexe.payment.repository.PaymentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import java.util.List;

@Service
public class PaymentAdminService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final BillingService billingService;
    private final WalletService walletService;

    public PaymentAdminService(PaymentOrderRepository paymentOrderRepository,
                               BillingService billingService,
                               WalletService walletService) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.billingService = billingService;
        this.walletService = walletService;
    }

    public List<PaymentOrderResponse> listOrders(PaymentStatus status) {
        List<PaymentOrder> orders = status == null
            ? paymentOrderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            : paymentOrderRepository.findAllByStatusOrderByCreatedAtDesc(status);
        return orders.stream().map(this::toResponse).toList();
    }

    public PaymentOrderResponse reviewOrder(String orderCode,
                                            PaymentReviewAction action,
                                            PaymentApplyTarget applyTo) {
        PaymentOrder order = paymentOrderRepository.findByOrderCode(orderCode)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ORDER_NOT_FOUND", "Order not found"));

        if (order.getStatus() == PaymentStatus.PAID || order.getStatus() == PaymentStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ORDER_ALREADY_REVIEWED", "Order has been reviewed already");
        }

        if (action == PaymentReviewAction.REJECT) {
            order.setStatus(PaymentStatus.REJECTED);
            paymentOrderRepository.save(order);
            return toResponse(order);
        }

        if (applyTo == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "APPLY_TARGET_REQUIRED", "Apply target is required for approval");
        }

        order.setStatus(PaymentStatus.PAID);
        order.setProvider(PaymentProvider.MANUAL);
        paymentOrderRepository.save(order);

        if (applyTo == PaymentApplyTarget.SUBSCRIPTION) {
            billingService.activatePaidSubscription(
                order.getUserId(),
                order.getPlanCode(),
                order.getDurationMonths(),
                PaymentProvider.MANUAL,
                order.getOrderCode()
            );
        } else if (applyTo == PaymentApplyTarget.WALLET) {
            walletService.credit(order.getUserId(), order.getAmountVnd());
        }

        return toResponse(order);
    }

    private PaymentOrderResponse toResponse(PaymentOrder order) {
        return new PaymentOrderResponse(
            order.getUserId(),
            order.getPlanCode(),
            order.getDurationMonths(),
            order.getAmountVnd(),
            order.getProvider(),
            order.getStatus(),
            order.getOrderCode(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
}
