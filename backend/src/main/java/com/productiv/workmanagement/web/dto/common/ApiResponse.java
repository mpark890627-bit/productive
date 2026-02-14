package com.productiv.workmanagement.web.dto.common;

public record ApiResponse<T>(
    T data,
    Object meta
) {

    public static <T> ApiResponse<T> of(T data) {
        return new ApiResponse<>(data, null);
    }

    public static <T> ApiResponse<T> of(T data, Object meta) {
        return new ApiResponse<>(data, meta);
    }
}
