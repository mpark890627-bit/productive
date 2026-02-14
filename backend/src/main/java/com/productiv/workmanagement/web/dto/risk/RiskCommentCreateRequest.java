package com.productiv.workmanagement.web.dto.risk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RiskCommentCreateRequest(
    @NotBlank @Size(max = 3000) String content
) {
}
