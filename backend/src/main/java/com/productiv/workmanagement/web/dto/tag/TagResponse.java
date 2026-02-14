package com.productiv.workmanagement.web.dto.tag;

import java.time.Instant;
import java.util.UUID;

public record TagResponse(
    UUID id,
    String name,
    Instant createdAt,
    Instant updatedAt
) {
}
