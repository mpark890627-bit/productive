package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.ActivityLogService;
import com.productiv.workmanagement.web.dto.activity.ActivityLogResponse;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/activity")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getByEntity(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam String entityType,
        @RequestParam UUID entityId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ActivityLogResponse> page = activityLogService.getByEntity(principal.getUserId(), entityType, entityId, pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }
}
