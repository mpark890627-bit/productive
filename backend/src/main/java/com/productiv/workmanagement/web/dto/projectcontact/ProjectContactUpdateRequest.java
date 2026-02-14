package com.productiv.workmanagement.web.dto.projectcontact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ProjectContactUpdateRequest(
    @Size(max = 120) String name,
    @Size(max = 120) String role,
    @Email @Size(max = 255) String email,
    @Size(max = 50) String phone,
    @Size(max = 2000) String memo
) {
}
