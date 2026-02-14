package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.RecurringTaskService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleCreateRequest;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleResponse;
import com.productiv.workmanagement.web.dto.recurring.RecurringRuleUpdateRequest;
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
@RequestMapping("/api/recurring-rules")
public class RecurringTaskController {

    private final RecurringTaskService recurringTaskService;

    public RecurringTaskController(RecurringTaskService recurringTaskService) {
        this.recurringTaskService = recurringTaskService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringRuleResponse>>> getMine(
        @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.of(recurringTaskService.getMine(principal.getUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringRuleResponse>> create(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @Valid @RequestBody RecurringRuleCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(recurringTaskService.create(principal.getUserId(), request)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringRuleResponse>> patch(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id,
        @Valid @RequestBody RecurringRuleUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.of(recurringTaskService.patch(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID id
    ) {
        recurringTaskService.delete(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.of(null));
    }
}
