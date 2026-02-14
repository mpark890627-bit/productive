package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.common.security.CustomUserPrincipal;
import com.productiv.workmanagement.service.UserDirectoryService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.common.PageMeta;
import com.productiv.workmanagement.web.dto.user.UserOptionResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserDirectoryService userDirectoryService;

    public UserController(UserDirectoryService userDirectoryService) {
        this.userDirectoryService = userDirectoryService;
    }

    @GetMapping("/projects/{projectId}/users")
    public ResponseEntity<ApiResponse<List<UserOptionResponse>>> searchUsers(
        @AuthenticationPrincipal CustomUserPrincipal principal,
        @PathVariable UUID projectId,
        @RequestParam(required = false) String keyword,
        @PageableDefault(size = 30) Pageable pageable
    ) {
        Page<UserOptionResponse> page = userDirectoryService.searchUsersInProject(
            principal.getUserId(),
            projectId,
            keyword,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.of(page.getContent(), PageMeta.from(page)));
    }
}
