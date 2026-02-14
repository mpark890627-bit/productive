package com.productiv.workmanagement.domain.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_task_links")
public class RiskTaskLink {

    @EmbeddedId
    private RiskTaskLinkId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("riskId")
    @JoinColumn(name = "risk_id", nullable = false)
    private Risk risk;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("taskId")
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    public RiskTaskLinkId getId() {
        return id;
    }

    public void setId(RiskTaskLinkId id) {
        this.id = id;
    }

    public Risk getRisk() {
        return risk;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}
