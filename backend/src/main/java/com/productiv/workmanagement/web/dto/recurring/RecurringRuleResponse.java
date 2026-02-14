package com.productiv.workmanagement.web.dto.recurring;

import com.productiv.workmanagement.domain.entity.enums.RecurringIntervalType;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import java.time.Instant;
import java.util.UUID;

public record RecurringRuleResponse(
    UUID id,
    UUID projectId,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    Integer dueOffsetDays,
    RecurringIntervalType intervalType,
    Integer intervalValue,
    Instant nextRunAt,
    boolean active,
    Instant lastGeneratedAt,
    Instant createdAt,
    Instant updatedAt
) {
}
