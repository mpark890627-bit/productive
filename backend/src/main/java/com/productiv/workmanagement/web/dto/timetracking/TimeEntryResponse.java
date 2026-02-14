package com.productiv.workmanagement.web.dto.timetracking;

import java.time.Instant;
import java.util.UUID;

public record TimeEntryResponse(
    UUID id,
    UUID taskId,
    Instant startedAt,
    Instant endedAt,
    Long durationSeconds,
    String note,
    Instant createdAt,
    Instant updatedAt
) {
}
