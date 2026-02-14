package com.productiv.workmanagement.web.dto.auth;

import java.util.UUID;

public record MeResponse(
    UUID userId,
    String email,
    String name,
    String role
) {
}
