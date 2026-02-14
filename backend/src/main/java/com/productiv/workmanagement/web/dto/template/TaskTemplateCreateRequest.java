package com.productiv.workmanagement.web.dto.template;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record TaskTemplateCreateRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 2000) String description,
    @Valid List<TaskTemplateItemRequest> items
) {
}
