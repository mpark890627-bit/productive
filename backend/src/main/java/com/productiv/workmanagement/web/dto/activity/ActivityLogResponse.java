package com.productiv.workmanagement.web.dto.activity;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ActivityLogResponse(
    UUID id,
    UUID actorUserId,
    String entityType,
    UUID entityId,
    String action,
    Map<String, Object> meta,
    Instant createdAt
) {
}
