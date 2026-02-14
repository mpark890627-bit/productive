package com.productiv.workmanagement.web.dto.inbox;

import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record SavedViewUpdateRequest(
    @Size(max = 120) String name,
    SavedViewTargetType targetType,
    Map<String, Object> filterJson,
    Map<String, Object> sortJson
) {
}
