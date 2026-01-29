package com.connectexe.payment.service;

import com.connectexe.payment.domain.entity.PaymentWallet;
import com.connectexe.payment.repository.PaymentWalletRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WalletService {

    private final PaymentWalletRepository paymentWalletRepository;

    public WalletService(PaymentWalletRepository paymentWalletRepository) {
        this.paymentWalletRepository = paymentWalletRepository;
    }

    public PaymentWallet credit(UUID userId, long amountVnd) {
        if (amountVnd <= 0) {
            return getOrCreateWallet(userId);
        }
        PaymentWallet wallet = getOrCreateWallet(userId);
        wallet.setBalanceVnd(wallet.getBalanceVnd() + amountVnd);
        return paymentWalletRepository.save(wallet);
    }

    public PaymentWallet getOrCreateWallet(UUID userId) {
        return paymentWalletRepository.findById(userId)
            .orElseGet(() -> {
                PaymentWallet wallet = new PaymentWallet();
                wallet.setUserId(userId);
                wallet.setBalanceVnd(0L);
                return paymentWalletRepository.save(wallet);
            });
    }
}
