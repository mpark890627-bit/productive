package com.productiv.workmanagement.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class RiskTagId implements Serializable {

    @Column(name = "risk_id")
    private UUID riskId;

    @Column(name = "tag_id")
    private UUID tagId;

    public RiskTagId() {
    }

    public RiskTagId(UUID riskId, UUID tagId) {
        this.riskId = riskId;
        this.tagId = tagId;
    }

    public UUID getRiskId() {
        return riskId;
    }

    public UUID getTagId() {
        return tagId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RiskTagId that)) return false;
        return Objects.equals(riskId, that.riskId) && Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(riskId, tagId);
    }
}
