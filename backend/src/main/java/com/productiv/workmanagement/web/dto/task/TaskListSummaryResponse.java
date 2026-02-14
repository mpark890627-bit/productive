package com.productiv.workmanagement.web.dto.task;

public record TaskListSummaryResponse(
    long totalCount,
    long inProgressCount,
    long dueSoonCount,
    long overdueCount
) {
}
