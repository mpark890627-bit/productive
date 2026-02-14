package com.productiv.workmanagement.domain.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_tags")
public class RiskTag {

    @EmbeddedId
    private RiskTagId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("riskId")
    @JoinColumn(name = "risk_id", nullable = false)
    private Risk risk;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    public RiskTagId getId() {
        return id;
    }

    public void setId(RiskTagId id) {
        this.id = id;
    }

    public Risk getRisk() {
        return risk;
    }

    public void setRisk(Risk risk) {
        this.risk = risk;
    }

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }
}
