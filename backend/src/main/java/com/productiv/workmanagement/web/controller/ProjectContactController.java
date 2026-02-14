package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.ProjectContactService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactCreateRequest;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactResponse;
import com.productiv.workmanagement.web.dto.projectcontact.ProjectContactUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/projects/{projectId}/contacts")
public class ProjectContactController {

    private final ProjectContactService projectContactService;

    public ProjectContactController(ProjectContactService projectContactService) {
        this.projectContactService = projectContactService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectContactResponse>>> getAll(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId
    ) {
        return ResponseEntity.ok(ApiResponse.of(projectContactService.getAll(principal.getUserId(), projectId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectContactResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @Valid @RequestBody ProjectContactCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(projectContactService.create(principal.getUserId(), projectId, request)));
    }

    @PatchMapping("/{contactId}")
    public ResponseEntity<ApiResponse<ProjectContactResponse>> patch(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @PathVariable UUID contactId,
        @Valid @RequestBody ProjectContactUpdateRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.of(projectContactService.patch(principal.getUserId(), projectId, contactId, request))
        );
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @PathVariable UUID contactId
    ) {
        projectContactService.delete(principal.getUserId(), projectId, contactId);
        return ResponseEntity.ok(ApiResponse.of(null));
    }
}
