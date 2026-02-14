package com.productiv.workmanagement.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class RiskTaskLinkId implements Serializable {

    @Column(name = "risk_id")
    private UUID riskId;

    @Column(name = "task_id")
    private UUID taskId;

    public RiskTaskLinkId() {
    }

    public RiskTaskLinkId(UUID riskId, UUID taskId) {
        this.riskId = riskId;
        this.taskId = taskId;
    }

    public UUID getRiskId() {
        return riskId;
    }

    public UUID getTaskId() {
        return taskId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RiskTaskLinkId that)) return false;
        return Objects.equals(riskId, that.riskId) && Objects.equals(taskId, that.taskId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(riskId, taskId);
    }
}
