package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.domain.entity.enums.SavedViewTargetType;
import com.productiv.workmanagement.service.InboxService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.inbox.SavedViewCreateRequest;
import com.productiv.workmanagement.web.dto.inbox.SavedViewResponse;
import com.productiv.workmanagement.web.dto.inbox.SavedViewUpdateRequest;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/saved-views")
public class SavedViewController {

    private final InboxService inboxService;

    public SavedViewController(InboxService inboxService) {
        this.inboxService = inboxService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavedViewResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody SavedViewCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.of(inboxService.createSavedView(principal.getUserId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedViewResponse>>> getMine(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @RequestParam(required = false) SavedViewTargetType targetType
    ) {
        return ResponseEntity.ok(ApiResponse.of(inboxService.getSavedViews(principal.getUserId(), targetType)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<SavedViewResponse>> patch(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody SavedViewUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(inboxService.patchSavedView(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        inboxService.deleteSavedView(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.of(null));
    }
}
