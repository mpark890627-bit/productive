package com.productiv.workmanagement.web.dto.projectcontact;

import java.time.Instant;
import java.util.UUID;

public record ProjectContactResponse(
    UUID id,
    UUID projectId,
    String name,
    String role,
    String email,
    String phone,
    String memo,
    Instant createdAt,
    Instant updatedAt
) {
}
