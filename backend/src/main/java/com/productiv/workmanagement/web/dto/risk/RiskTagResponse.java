package com.productiv.workmanagement.web.dto.risk;

import java.util.UUID;

public record RiskTagResponse(
    UUID id,
    String name
) {
}
