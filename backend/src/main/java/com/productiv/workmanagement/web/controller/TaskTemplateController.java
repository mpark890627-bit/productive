package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.TaskTemplateService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.template.TaskTemplateApplyRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateApplyResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateCreateRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateResponse;
import com.productiv.workmanagement.web.dto.template.TaskTemplateItemUpdateRequest;
import com.productiv.workmanagement.web.dto.template.TaskTemplateUpdateRequest;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TaskTemplateController {

    private final TaskTemplateService taskTemplateService;

    public TaskTemplateController(TaskTemplateService taskTemplateService) {
        this.taskTemplateService = taskTemplateService;
    }

    @GetMapping("/task-templates")
    public ResponseEntity<ApiResponse<List<TaskTemplateResponse>>> getMine(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<TaskTemplateResponse> page = taskTemplateService.getMine(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @PostMapping("/task-templates")
    public ResponseEntity<ApiResponse<TaskTemplateResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody TaskTemplateCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(taskTemplateService.create(principal.getUserId(), request)));
    }

    @GetMapping("/task-templates/{id}")
    public ResponseEntity<ApiResponse<TaskTemplateResponse>> getById(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskTemplateService.getById(principal.getUserId(), id)));
    }

    @PatchMapping("/task-templates/{id}")
    public ResponseEntity<ApiResponse<TaskTemplateResponse>> patch(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody TaskTemplateUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskTemplateService.patch(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/task-templates/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        taskTemplateService.delete(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @PostMapping("/task-templates/{templateId}/items")
    public ResponseEntity<ApiResponse<TaskTemplateItemResponse>> createItem(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID templateId,
        @Valid @RequestBody TaskTemplateItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(taskTemplateService.createItem(principal.getUserId(), templateId, request)));
    }

    @PatchMapping("/task-template-items/{itemId}")
    public ResponseEntity<ApiResponse<TaskTemplateItemResponse>> patchItem(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID itemId,
        @Valid @RequestBody TaskTemplateItemUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskTemplateService.patchItem(principal.getUserId(), itemId, request)));
    }

    @DeleteMapping("/task-template-items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID itemId
    ) {
        taskTemplateService.deleteItem(principal.getUserId(), itemId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @PostMapping("/projects/{projectId}/task-templates/{templateId}/apply")
    public ResponseEntity<ApiResponse<TaskTemplateApplyResponse>> apply(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @PathVariable UUID templateId,
        @RequestBody(required = false) TaskTemplateApplyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskTemplateService.applyToProject(
            principal.getUserId(),
            projectId,
            templateId,
            request
        )));
    }
}
