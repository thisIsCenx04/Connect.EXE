package com.connectexe.payment.domain.entity;

import com.connectexe.payment.domain.enums.PlanCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
public class Plan {

    @Id
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "code", nullable = false, columnDefinition = "plan_code")
    private PlanCode code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price_month_usd", nullable = false)
    private BigDecimal priceMonthUsd;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
