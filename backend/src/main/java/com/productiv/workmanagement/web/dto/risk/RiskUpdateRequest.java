package com.productiv.workmanagement.web.dto.risk;

import com.productiv.workmanagement.domain.entity.enums.RiskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record RiskUpdateRequest(
    @Size(min = 1, max = 255) String title,
    String description,
    @Size(max = 120) String category,
    RiskStatus status,
    @Min(1) @Max(5) Short probability,
    @Min(1) @Max(5) Short impact,
    UUID ownerUserId,
    LocalDate nextReviewDate,
    String mitigationPlan,
    String contingencyPlan,
    String triggers
) {
}
