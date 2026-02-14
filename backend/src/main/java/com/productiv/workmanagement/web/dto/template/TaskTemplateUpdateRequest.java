package com.productiv.workmanagement.web.dto.template;

import jakarta.validation.constraints.Size;

public record TaskTemplateUpdateRequest(
    @Size(max = 150) String name,
    @Size(max = 2000) String description
) {
}
