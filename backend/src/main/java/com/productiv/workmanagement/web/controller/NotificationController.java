package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.NotificationService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.notification.NotificationResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMine(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<NotificationResponse> page = notificationService.getMyNotifications(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.of(notificationService.markRead(principal.getUserId(), id)));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        int count = notificationService.markAllRead(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.of(Map.of("updated", count)));
    }
}
