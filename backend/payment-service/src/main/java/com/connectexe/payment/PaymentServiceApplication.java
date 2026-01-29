package com.connectexe.payment;

import com.connectexe.payment.config.JwtProperties;
import com.connectexe.payment.config.ManualPaymentProperties;
import com.connectexe.payment.config.MomoProperties;
import com.connectexe.payment.config.VnpayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(scanBasePackages = "com.connectexe")
@EnableConfigurationProperties({ JwtProperties.class, VnpayProperties.class, MomoProperties.class, ManualPaymentProperties.class })
public class PaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}
