package com.productiv.workmanagement.web.dto.risk;

public record RiskMatrixCellResponse(
    short probability,
    short impact,
    long count
) {
}
