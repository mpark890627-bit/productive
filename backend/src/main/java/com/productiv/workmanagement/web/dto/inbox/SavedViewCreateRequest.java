package com.productiv.workmanagement.web.dto.inbox;

import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record SavedViewCreateRequest(
    @NotBlank @Size(max = 120) String name,
    @NotNull SavedViewTargetType targetType,
    Map<String, Object> filterJson,
    Map<String, Object> sortJson
) {
}
