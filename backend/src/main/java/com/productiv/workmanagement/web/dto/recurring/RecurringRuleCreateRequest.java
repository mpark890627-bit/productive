package com.productiv.workmanagement.web.dto.recurring;

import com.productiv.workmanagement.domain.entity.enums.RecurringIntervalType;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record RecurringRuleCreateRequest(
    @NotNull UUID projectId,
    @NotBlank @Size(max = 255) String title,
    @Size(max = 4000) String description,
    TaskStatus status,
    TaskPriority priority,
    Integer dueOffsetDays,
    @NotNull RecurringIntervalType intervalType,
    @NotNull Integer intervalValue,
    @NotNull Instant nextRunAt
) {
}
