package com.productiv.workmanagement.web.dto.risk;

import com.productiv.workmanagement.domain.entity.enums.RiskActionStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record RiskActionUpdateRequest(
    @Size(min = 1, max = 255) String title,
    String description,
    RiskActionStatus status,
    LocalDate dueDate,
    UUID assigneeUserId
) {
}
