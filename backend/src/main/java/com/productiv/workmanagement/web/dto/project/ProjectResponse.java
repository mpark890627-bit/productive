package com.productiv.workmanagement.web.dto.project;

import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
    UUID id,
    UUID ownerUserId,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt
) {
}
