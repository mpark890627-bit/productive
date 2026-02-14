package com.productiv.workmanagement.web.dto.project;

import jakarta.validation.constraints.Size;

public record ProjectUpdateRequest(
    @Size(max = 200) String name,
    @Size(max = 2000) String description
) {
}
