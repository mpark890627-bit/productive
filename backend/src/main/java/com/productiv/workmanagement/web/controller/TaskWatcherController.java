package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.InboxService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.inbox.TaskWatcherResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskWatcherController {

    private final InboxService inboxService;

    public TaskWatcherController(InboxService inboxService) {
        this.inboxService = inboxService;
    }

    @PostMapping("/{taskId}/watch")
    public ResponseEntity<ApiResponse<Void>> watchTask(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId
    ) {
        inboxService.watchTask(principal.getUserId(), taskId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(null));
    }

    @DeleteMapping("/{taskId}/watch")
    public ResponseEntity<ApiResponse<Void>> unwatchTask(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId
    ) {
        inboxService.unwatchTask(principal.getUserId(), taskId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @GetMapping("/{taskId}/watchers")
    public ResponseEntity<ApiResponse<List<TaskWatcherResponse>>> getTaskWatchers(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(inboxService.getTaskWatchers(principal.getUserId(), taskId)));
    }
}
