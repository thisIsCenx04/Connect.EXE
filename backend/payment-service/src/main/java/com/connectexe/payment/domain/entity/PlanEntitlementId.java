package com.connectexe.payment.domain.entity;

import com.connectexe.payment.domain.enums.EntitlementKey;
import com.connectexe.payment.domain.enums.PlanCode;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class PlanEntitlementId implements Serializable {

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "plan_code", nullable = false, columnDefinition = "plan_code")
    private PlanCode planCode;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "key", nullable = false, columnDefinition = "entitlement_key")
    private EntitlementKey key;

    public PlanEntitlementId(PlanCode planCode, EntitlementKey key) {
        this.planCode = planCode;
        this.key = key;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlanEntitlementId that = (PlanEntitlementId) o;
        return planCode == that.planCode && key == that.key;
    }

    @Override
    public int hashCode() {
        return Objects.hash(planCode, key);
    }
}
