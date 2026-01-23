package com.connectexe.payment.domain.entity;

import com.connectexe.payment.domain.enums.PaymentProvider;
import com.connectexe.payment.domain.enums.PaymentStatus;
import com.connectexe.payment.domain.enums.PlanCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_orders")
@Getter
@Setter
@NoArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "plan_code", nullable = false, columnDefinition = "plan_code")
    private PlanCode planCode;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "amount_vnd", nullable = false)
    private Long amountVnd;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "payment_provider")
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "order_code", nullable = false, unique = true)
    private String orderCode;

    @Column(name = "request_id")
    private String requestId;

    @Column(name = "provider_trans_id")
    private String providerTransId;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "pay_url")
    private String payUrl;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
