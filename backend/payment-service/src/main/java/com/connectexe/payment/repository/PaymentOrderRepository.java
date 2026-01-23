package com.connectexe.payment.repository;

import com.connectexe.payment.domain.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, UUID> {
    Optional<PaymentOrder> findByOrderCode(String orderCode);
    Optional<PaymentOrder> findByRequestId(String requestId);
}
