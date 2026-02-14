package com.productiv.workmanagement.web.dto.template;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.entity.enums.TemplateDefaultAssignee;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TaskTemplateResponse(
    UUID id,
    String name,
    String description,
    List<Item> items,
    Instant createdAt,
    Instant updatedAt
) {
    public record Item(
        UUID id,
        String title,
        String description,
        TaskStatus defaultStatus,
        TaskPriority defaultPriority,
        TemplateDefaultAssignee defaultAssignee,
        Integer dueOffsetDays,
        Integer sortOrder
    ) {
    }
}
