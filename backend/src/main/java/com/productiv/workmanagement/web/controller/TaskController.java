package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.domain.entity.enums.TaskPriority;
import com.productiv.workmanagement.domain.entity.enums.TaskStatus;
import com.productiv.workmanagement.service.TaskService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.task.TaskCreateRequest;
import com.productiv.workmanagement.web.dto.task.TaskListSummaryResponse;
import com.productiv.workmanagement.web.dto.task.TaskResponse;
import com.productiv.workmanagement.web.dto.task.TaskUpdateRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
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
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @Valid @RequestBody TaskCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(taskService.create(principal.getUserId(), projectId, request)));
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getInProject(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) UUID assigneeUserId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
        @RequestParam(required = false) String keyword,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<TaskResponse> page = taskService.searchInProject(
            principal.getUserId(),
            projectId,
            status,
            assigneeUserId,
            dueFrom,
            dueTo,
            keyword,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOwnedTasks(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam(required = false) UUID projectId,
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(required = false) TaskPriority priority,
        @RequestParam(required = false) UUID assigneeUserId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
        @RequestParam(required = false) String keyword,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<TaskResponse> page = taskService.searchOwnedTasks(
            principal.getUserId(),
            projectId,
            status,
            priority,
            assigneeUserId,
            dueFrom,
            dueTo,
            keyword,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }

    @GetMapping("/tasks/summary")
    public ResponseEntity<ApiResponse<TaskListSummaryResponse>> getOwnedTasksSummary(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam(required = false) UUID projectId
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskService.getOwnedSummary(principal.getUserId(), projectId)));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getById(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskService.getById(principal.getUserId(), id)));
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> patch(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody TaskUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(taskService.patch(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        taskService.delete(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.of(null));
    }

    @PostMapping("/tasks/{taskId}/tags/{tagId}")
    public ResponseEntity<ApiResponse<Void>> attachTag(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId,
        @PathVariable UUID tagId
    ) {
        taskService.addTag(principal.getUserId(), taskId, tagId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(null));
    }

    @DeleteMapping("/tasks/{taskId}/tags/{tagId}")
    public ResponseEntity<ApiResponse<Void>> detachTag(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID taskId,
        @PathVariable UUID tagId
    ) {
        taskService.removeTag(principal.getUserId(), taskId, tagId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }
}
