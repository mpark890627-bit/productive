package com.productiv.workmanagement.web.dto.risk;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import java.time.LocalDate;
import java.util.UUID;

public record RiskLinkedTaskResponse(
    UUID id,
    String title,
    TaskStatus status,
    TaskPriority priority,
    LocalDate dueDate
) {
}
