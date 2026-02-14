package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.TimeTrackingService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.timetracking.TimeEntryResponse;
import com.productiv.workmanagement.web.dto.timetracking.TimeEntryStopRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks/{taskId}/time")
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;

    public TimeTrackingController(TimeTrackingService timeTrackingService) {
        this.timeTrackingService = timeTrackingService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<TimeEntryResponse>> start(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(timeTrackingService.start(principal.getUserId(), taskId)));
    }

    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<TimeEntryResponse>> stop(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId,
        @Valid @RequestBody TimeEntryStopRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(timeTrackingService.stop(principal.getUserId(), taskId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimeEntryResponse>>> getTaskEntries(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(timeTrackingService.getTaskEntries(principal.getUserId(), taskId)));
    }
}
