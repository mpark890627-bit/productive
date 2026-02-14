package com.productiv.workmanagement.web.dto.task;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
    UUID id,
    UUID projectId,
    String title,
    String description,
    TaskStatus status,
    TaskPriority priority,
    LocalDate dueDate,
    UUID assigneeUserId,
    List<TagItem> tags,
    Instant createdAt,
    Instant updatedAt
) {
    public record TagItem(UUID id, String name) {
    }
}
