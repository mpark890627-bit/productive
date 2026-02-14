package com.productiv.workmanagement.web.dto.approval;

import jakarta.validation.constraints.Size;

public record ApprovalDecisionRequest(
    @Size(max = 4000) String comment
) {
}
