package com.productiv.workmanagement.web.dto.risk;

import java.util.Map;

public record RiskSummaryResponse(
    Map<String, Long> statusCounts,
    Map<String, Long> levelBucketCounts,
    long overdueActionsCount
) {
}
