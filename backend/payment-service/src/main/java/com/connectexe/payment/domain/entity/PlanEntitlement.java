package com.connectexe.payment.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "plan_entitlements")
@Getter
@Setter
@NoArgsConstructor
public class PlanEntitlement {

    @EmbeddedId
    private PlanEntitlementId id;

    @Column(name = "limit_value")
    private Integer limitValue;
}
