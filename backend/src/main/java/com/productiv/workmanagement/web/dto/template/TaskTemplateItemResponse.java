package com.productiv.workmanagement.web.dto.template;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.entity.enums.TemplateDefaultAssignee;
import java.time.Instant;
import java.util.UUID;

public record TaskTemplateItemResponse(
    UUID id,
    UUID templateId,
    String title,
    String description,
    TaskStatus defaultStatus,
    TaskPriority defaultPriority,
    TemplateDefaultAssignee defaultAssignee,
    Integer dueOffsetDays,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
}
