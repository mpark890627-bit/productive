package com.productiv.workmanagement.web.dto.user;

import java.util.UUID;

public record UserOptionResponse(
    UUID userId,
    String name,
    String email
) {
}
