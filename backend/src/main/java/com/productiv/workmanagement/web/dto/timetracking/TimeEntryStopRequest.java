package com.productiv.workmanagement.web.dto.timetracking;

import jakarta.validation.constraints.Size;

public record TimeEntryStopRequest(
    @Size(max = 500) String note
) {
}
