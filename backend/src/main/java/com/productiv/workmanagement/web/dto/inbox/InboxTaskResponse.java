package com.productiv.workmanagement.web.dto.inbox;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InboxTaskResponse(
    UUID id,
    UUID projectId,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    LocalDate dueDate,
    UUID assigneeUserId,
    Instant updatedAt
) {
}
