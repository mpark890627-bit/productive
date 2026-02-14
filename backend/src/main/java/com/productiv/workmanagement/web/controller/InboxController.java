package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.service.InboxService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.inbox.InboxMode;
import com.productiv.workmanagement.web.dto.inbox.InboxTaskResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inbox")
public class InboxController {

    private final InboxService inboxService;

    public InboxController(InboxService inboxService) {
        this.inboxService = inboxService;
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<InboxTaskResponse>>> getInboxTasks(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam(required = false) InboxMode mode,
        @RequestParam(required = false) List<TaskStatus> status,
        @RequestParam(required = false) java.util.UUID projectId,
        @RequestParam(required = false) String keyword,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<InboxTaskResponse> page = inboxService.getInboxTasks(
            principal.getUserId(),
            mode,
            status,
            projectId,
            keyword,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }
}
