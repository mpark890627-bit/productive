package com.productiv.workmanagement.web.dto.risk;

import com.productiv.workmanagement.domain.entity.enums.RiskActionStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RiskActionResponse(
    UUID id,
    UUID riskId,
    String title,
    String description,
    RiskActionStatus status,
    LocalDate dueDate,
    UUID assigneeUserId,
    String assigneeUserName,
    Instant createdAt,
    Instant updatedAt
) {
}
