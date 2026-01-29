package com.connectexe.payment.service;

import com.connectexe.common.exception.ApiException;
import com.connectexe.payment.config.ManualPaymentProperties;
import com.connectexe.payment.domain.entity.PaymentOrder;
import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.domain.enums.PlanCode;
import com.connectexe.payment.dto.CheckoutResponse;
import com.connectexe.payment.dto.ManualPaymentInfoResponse;
import com.connectexe.payment.repository.PaymentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Map<Integer, Long> PREMIUM_PRICING_VND = Map.of(
        1, 29000L,
        3, 75000L,
        6, 145000L,
        12, 250000L
    );

    private final PaymentOrderRepository paymentOrderRepository;
    private final ManualPaymentProperties manualPaymentProperties;

    public PaymentService(PaymentOrderRepository paymentOrderRepository,
                          ManualPaymentProperties manualPaymentProperties) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.manualPaymentProperties = manualPaymentProperties;
    }

    public CheckoutResponse createCheckout(UUID userId,
                                           PlanCode planCode,
                                           Integer durationMonths) {
        if (planCode != PlanCode.PRO) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PLAN_NOT_SUPPORTED", "Only Premium plan is supported for checkout");
        }
        int resolvedMonths = resolveDurationMonths(durationMonths);
        long amountVnd = resolveAmountVnd(resolvedMonths);

        PaymentOrder order = new PaymentOrder();
        order.setUserId(userId);
        order.setPlanCode(planCode);
        order.setDurationMonths(resolvedMonths);
        order.setAmountVnd(amountVnd);
        order.setProvider(PaymentProvider.MANUAL);
        order.setStatus(PaymentStatus.PENDING);
        order.setOrderCode(generateOrderCode());
        paymentOrderRepository.save(order);

        String transferContent = buildTransferContent(order.getOrderCode());
        return new CheckoutResponse(
            order.getOrderCode(),
            amountVnd,
            transferContent,
            manualPaymentProperties.getQrImageUrl(),
            manualPaymentProperties.getBankName(),
            manualPaymentProperties.getBankAccountName(),
            manualPaymentProperties.getBankAccountNumber(),
            manualPaymentProperties.getBankBranch()
        );
    }

    public ManualPaymentInfoResponse getManualPaymentInfo() {
        return new ManualPaymentInfoResponse(
            manualPaymentProperties.getQrImageUrl(),
            manualPaymentProperties.getBankName(),
            manualPaymentProperties.getBankAccountName(),
            manualPaymentProperties.getBankAccountNumber(),
            manualPaymentProperties.getBankBranch(),
            resolveTransferPrefix()
        );
    }

    private int resolveDurationMonths(Integer durationMonths) {
        if (durationMonths == null) {
            return 1;
        }
        if (!PREMIUM_PRICING_VND.containsKey(durationMonths)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Unsupported billing duration");
        }
        return durationMonths;
    }

    private long resolveAmountVnd(int durationMonths) {
        Long amount = PREMIUM_PRICING_VND.get(durationMonths);
        if (amount == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DURATION", "Unsupported billing duration");
        }
        return amount;
    }

    private String generateOrderCode() {
        return "CE" + System.currentTimeMillis() + (int) (Math.random() * 1000);
    }

    private String buildTransferContent(String orderCode) {
        return resolveTransferPrefix() + orderCode;
    }

    private String resolveTransferPrefix() {
        String prefix = manualPaymentProperties.getTransferNotePrefix();
        if (isBlank(prefix)) {
            return "CE-";
        }
        return prefix;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
