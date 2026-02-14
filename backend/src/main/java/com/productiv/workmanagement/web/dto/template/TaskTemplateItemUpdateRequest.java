package com.productiv.workmanagement.web.dto.template;

import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.domain.entity.enums.TemplateDefaultAssignee;
import jakarta.validation.constraints.Size;

public record TaskTemplateItemUpdateRequest(
    @Size(max = 255) String title,
    @Size(max = 4000) String description,
    TaskStatus defaultStatus,
    TaskPriority defaultPriority,
    TemplateDefaultAssignee defaultAssignee,
    Integer dueOffsetDays,
    Integer sortOrder
) {
}
