package com.productiv.workmanagement.web.dto.comment;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    UUID taskId,
    UUID authorUserId,
    String authorName,
    String content,
    Instant createdAt,
    Instant updatedAt
) {
}
