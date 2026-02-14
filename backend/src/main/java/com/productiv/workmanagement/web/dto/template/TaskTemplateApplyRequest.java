package com.productiv.workmanagement.web.dto.template;

import java.time.LocalDate;
import java.util.UUID;

public record TaskTemplateApplyRequest(
    LocalDate baseDate,
    UUID overrideAssigneeUserId
) {
}
