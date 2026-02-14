package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.service.AuthService;
import com.productiv.workmanagement.web.dto.auth.MeResponse;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final AuthService authService;

    public MeController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MeResponse>> me() {
        return ResponseEntity.ok(ApiResponse.of(authService.me()));
    }
}
