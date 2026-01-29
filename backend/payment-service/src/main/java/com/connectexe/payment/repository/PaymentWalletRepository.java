package com.connectexe.payment.repository;

import com.connectexe.payment.domain.entity.PaymentWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentWalletRepository extends JpaRepository<PaymentWallet, UUID> {
}
