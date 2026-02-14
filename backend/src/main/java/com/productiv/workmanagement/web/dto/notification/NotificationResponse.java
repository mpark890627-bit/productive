package com.productiv.workmanagement.web.dto.notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String type,
    String title,
    String content,
    String linkUrl,
    String meta,
    boolean isRead,
    Instant readAt,
    Instant createdAt
) {
}
