package com.productiv.workmanagement.web.dto.approval;

import com.productiv.workmanagement.domain.entity.enums.ApprovalStatus;
import java.time.Instant;
import java.util.UUID;

public record ApprovalResponse(
    UUID id,
    UUID projectId,
    UUID taskId,
    UUID requesterUserId,
    UUID approverUserId,
    ApprovalStatus status,
    String reason,
    String decisionComment,
    Instant decidedAt,
    Instant createdAt,
    Instant updatedAt
) {
}
