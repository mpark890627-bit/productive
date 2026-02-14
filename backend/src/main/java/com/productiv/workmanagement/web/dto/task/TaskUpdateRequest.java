package com.productiv.workmanagement.web.dto.task;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record TaskUpdateRequest(
    @Size(max = 255) String title,
    @Size(max = 4000) String description,
    TaskStatus status,
    TaskPriority priority,
    LocalDate dueDate,
    UUID assigneeUserId
) {
}
