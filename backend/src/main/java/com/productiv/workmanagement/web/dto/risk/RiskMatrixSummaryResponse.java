package com.productiv.workmanagement.web.dto.risk;

import java.util.List;

public record RiskMatrixSummaryResponse(
    List<RiskMatrixCellResponse> cells
) {
}
