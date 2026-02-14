package com.productiv.workmanagement.web.controller;

import com.productiv.workmanagement.service.TagService;
import com.productiv.workmanagement.web.dto.common.ApiResponse;
import com.productiv.workmanagement.web.dto.tag.TagCreateRequest;
import com.productiv.workmanagement.web.dto.tag.TagResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TagResponse>> create(@Valid @RequestBody TagCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(tagService.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAll(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.of(tagService.getAll(keyword)));
    }
}
