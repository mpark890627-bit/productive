package com.productiv.workmanagement.web.dto.inbox;

import java.time.Instant;
import java.util.UUID;

public record TaskWatcherResponse(
    UUID userId,
    String name,
    String email,
    Instant watchedAt
) {
}
