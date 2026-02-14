package com.productiv.workmanagement.web.dto.template;

import java.util.List;
import java.util.UUID;

public record TaskTemplateApplyResponse(
    UUID projectId,
    UUID templateId,
    int createdCount,
    List<UUID> createdTaskIds
) {
}
