package com.productiv.workmanagement.web.dto.inbox;

import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record SavedViewResponse(
    UUID id,
    String name,
    SavedViewTargetType targetType,
    Map<String, Object> filterJson,
    Map<String, Object> sortJson,
    Instant createdAt,
    Instant updatedAt
) {
}
