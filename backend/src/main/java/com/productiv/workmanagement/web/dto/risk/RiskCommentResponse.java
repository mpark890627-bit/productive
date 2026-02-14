package com.productiv.workmanagement.web.dto.risk;

import java.time.Instant;
import java.util.UUID;

public record RiskCommentResponse(
    UUID id,
    UUID riskId,
    UUID authorUserId,
    String authorUserName,
    String content,
    Instant createdAt,
    Instant updatedAt
) {
}
