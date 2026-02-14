package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.domain.entity.enums.ApprovalStatus;
import com.productiv.workmanagement.service.ApprovalService;
import com.productiv.workmanagement.web.dto.approval.ApprovalCreateRequest;
import com.productiv.workmanagement.web.dto.approval.ApprovalDecisionRequest;
import com.productiv.workmanagement.web.dto.approval.ApprovalResponse;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ApprovalResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody ApprovalCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(approvalService.create(principal.getUserId(), request)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getMine(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam(required = false) ApprovalStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ApprovalResponse> page = approvalService.getMyApprovals(principal.getUserId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ApprovalResponse>> approve(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody(required = false) ApprovalDecisionRequest request
    ) {
        ApprovalDecisionRequest payload = request == null ? new ApprovalDecisionRequest(null) : request;
        return ResponseEntity.ok(ApiResponse.of(approvalService.approve(principal.getUserId(), id, payload)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ApprovalResponse>> reject(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody(required = false) ApprovalDecisionRequest request
    ) {
        ApprovalDecisionRequest payload = request == null ? new ApprovalDecisionRequest(null) : request;
        return ResponseEntity.ok(ApiResponse.of(approvalService.reject(principal.getUserId(), id, payload)));
    }
}
