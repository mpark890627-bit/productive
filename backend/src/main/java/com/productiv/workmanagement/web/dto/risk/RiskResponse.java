package com.productiv.workmanagement.web.dto.risk;

import com.productiv.workmanagement.domain.entity.enums.RiskLevelBucket;
import com.productiv.workmanagement.domain.entity.enums.RiskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RiskResponse(
    UUID id,
    UUID projectId,
    String title,
    String description,
    String category,
    RiskStatus status,
    short probability,
    short impact,
    int levelScore,
    RiskLevelBucket levelBucket,
    UUID ownerUserId,
    String ownerUserName,
    LocalDate nextReviewDate,
    String mitigationPlan,
    String contingencyPlan,
    String triggers,
    Instant closedAt,
    Instant createdAt,
    Instant updatedAt
) {
}
