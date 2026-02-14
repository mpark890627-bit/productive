package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.domain.entity.enums.RiskLevelBucket;
import com.productiv.workmanagement.domain.entity.enums.RiskStatus;
import com.productiv.workmanagement.service.RiskActionService;
import com.productiv.workmanagement.service.RiskCommentService;
import com.productiv.workmanagement.service.RiskRelationService;
import com.productiv.workmanagement.service.RiskService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.risk.RiskActionCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskActionResponse;
import com.productiv.workmanagement.web.dto.risk.RiskActionUpdateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskCommentCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskCommentResponse;
import com.productiv.workmanagement.web.dto.risk.RiskCreateRequest;
import com.productiv.workmanagement.web.dto.risk.RiskLinkedTaskResponse;
import com.productiv.workmanagement.web.dto.risk.RiskMatrixSummaryResponse;
import com.productiv.workmanagement.web.dto.risk.RiskResponse;
import com.productiv.workmanagement.web.dto.risk.RiskSummaryResponse;
import com.productiv.workmanagement.web.dto.risk.RiskTagResponse;
import com.productiv.workmanagement.web.dto.risk.RiskUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RiskController {

    private final RiskService riskService;
    private final RiskActionService riskActionService;
    private final RiskRelationService riskRelationService;
    private final RiskCommentService riskCommentService;

    public RiskController(
        RiskService riskService,
        RiskActionService riskActionService,
        RiskRelationService riskRelationService,
        RiskCommentService riskCommentService
    ) {
        this.riskService = riskService;
        this.riskActionService = riskActionService;
        this.riskRelationService = riskRelationService;
        this.riskCommentService = riskCommentService;
    }

    @PostMapping("/projects/{projectId}/risks")
    public ResponseEntity<ApiResponse<RiskResponse>> createRisk(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @Valid @RequestBody RiskCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(riskService.create(principal.getUserId(), projectId, request)));
    }

    @GetMapping("/projects/{projectId}/risks")
    public ResponseEntity<ApiResponse<List<RiskResponse>>> getRisks(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @RequestParam(required = false) RiskStatus status,
        @RequestParam(required = false) RiskLevelBucket levelBucket,
        @RequestParam(required = false) Short probability,
        @RequestParam(required = false) Short impact,
        @RequestParam(required = false) UUID ownerUserId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) UUID tagId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<RiskResponse> page = riskService.getAllInProject(
            principal.getUserId(),
            projectId,
            status,
            levelBucket,
            probability,
            impact,
            ownerUserId,
            keyword,
            tagId,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @GetMapping("/projects/{projectId}/risks/matrix-summary")
    public ResponseEntity<ApiResponse<RiskMatrixSummaryResponse>> getRiskMatrixSummary(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @RequestParam(required = false) RiskStatus status,
        @RequestParam(required = false) RiskLevelBucket levelBucket,
        @RequestParam(required = false) UUID ownerUserId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) UUID tagId
    ) {
        return ResponseEntity.ok(ApiResponse.of(
            riskService.getMatrixSummary(
                principal.getUserId(),
                projectId,
                status,
                levelBucket,
                ownerUserId,
                keyword,
                tagId
            )
        ));
    }

    @GetMapping("/projects/{projectId}/risks/summary")
    public ResponseEntity<ApiResponse<RiskSummaryResponse>> getRiskSummary(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskService.getSummary(principal.getUserId(), projectId)));
    }

    @GetMapping("/risks/{riskId}")
    public ResponseEntity<ApiResponse<RiskResponse>> getRiskById(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskService.getById(principal.getUserId(), riskId)));
    }

    @PatchMapping("/risks/{riskId}")
    public ResponseEntity<ApiResponse<RiskResponse>> patchRisk(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @Valid @RequestBody RiskUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskService.patch(principal.getUserId(), riskId, request)));
    }

    @DeleteMapping("/risks/{riskId}")
    public ResponseEntity<ApiResponse<Void>> deleteRisk(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId
    ) {
        riskService.delete(principal.getUserId(), riskId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @PostMapping("/risks/{riskId}/close")
    public ResponseEntity<ApiResponse<RiskResponse>> closeRisk(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskService.close(principal.getUserId(), riskId)));
    }

    @PostMapping("/risks/{riskId}/actions")
    public ResponseEntity<ApiResponse<RiskActionResponse>> createRiskAction(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @Valid @RequestBody RiskActionCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(riskActionService.create(principal.getUserId(), riskId, request)));
    }

    @GetMapping("/risks/{riskId}/actions")
    public ResponseEntity<ApiResponse<List<RiskActionResponse>>> getRiskActions(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<RiskActionResponse> page = riskActionService.getByRisk(principal.getUserId(), riskId, pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @PatchMapping("/risk-actions/{actionId}")
    public ResponseEntity<ApiResponse<RiskActionResponse>> patchRiskAction(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID actionId,
        @Valid @RequestBody RiskActionUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskActionService.patch(principal.getUserId(), actionId, request)));
    }

    @DeleteMapping("/risk-actions/{actionId}")
    public ResponseEntity<ApiResponse<Void>> deleteRiskAction(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID actionId
    ) {
        riskActionService.delete(principal.getUserId(), actionId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @PostMapping("/risks/{riskId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> linkTask(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PathVariable UUID taskId
    ) {
        riskRelationService.linkTask(principal.getUserId(), riskId, taskId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(null));
    }

    @DeleteMapping("/risks/{riskId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> unlinkTask(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PathVariable UUID taskId
    ) {
        riskRelationService.unlinkTask(principal.getUserId(), riskId, taskId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @GetMapping("/risks/{riskId}/tasks")
    public ResponseEntity<ApiResponse<List<RiskLinkedTaskResponse>>> getLinkedTasks(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskRelationService.getLinkedTasks(principal.getUserId(), riskId)));
    }

    @PostMapping("/risks/{riskId}/tags/{tagId}")
    public ResponseEntity<ApiResponse<Void>> addTag(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PathVariable UUID tagId
    ) {
        riskRelationService.addTag(principal.getUserId(), riskId, tagId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(null));
    }

    @DeleteMapping("/risks/{riskId}/tags/{tagId}")
    public ResponseEntity<ApiResponse<Void>> removeTag(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PathVariable UUID tagId
    ) {
        riskRelationService.removeTag(principal.getUserId(), riskId, tagId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @GetMapping("/risks/{riskId}/tags")
    public ResponseEntity<ApiResponse<List<RiskTagResponse>>> getRiskTags(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId
    ) {
        return ResponseEntity.ok(ApiResponse.of(riskRelationService.getTags(principal.getUserId(), riskId)));
    }

    @PostMapping("/risks/{riskId}/comments")
    public ResponseEntity<ApiResponse<RiskCommentResponse>> createComment(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @Valid @RequestBody RiskCommentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(riskCommentService.create(principal.getUserId(), riskId, request)));
    }

    @GetMapping("/risks/{riskId}/comments")
    public ResponseEntity<ApiResponse<List<RiskCommentResponse>>> getComments(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID riskId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<RiskCommentResponse> page = riskCommentService.getByRisk(principal.getUserId(), riskId, pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @DeleteMapping("/risk-comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID commentId
    ) {
        riskCommentService.delete(principal.getUserId(), commentId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }
}
