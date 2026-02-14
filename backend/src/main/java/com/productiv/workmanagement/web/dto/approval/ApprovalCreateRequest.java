package com.productiv.workmanagement.web.dto.approval;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ApprovalCreateRequest(
    @NotNull UUID projectId,
    UUID taskId,
    @NotNull UUID approverUserId,
    @Size(max = 4000) String reason
) {
}
