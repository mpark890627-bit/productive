package com.productiv.workmanagement.integration;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    void registerAndLoginSuccess() throws Exception {
        String registerBody = """
            {
              "email": "auth_user@example.com",
              "password": "password123",
              "name": "Auth User"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
            .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.data.email").value("auth_user@example.com"))
            .andExpect(jsonPath("$.data.name").value("Auth User"))
            .andExpect(jsonPath("$.data.role").value("USER"));

        String loginBody = """
            {
              "email": "auth_user@example.com",
              "password": "password123"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
            .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.data.email").value("auth_user@example.com"))
            .andExpect(jsonPath("$.data.name").value("Auth User"))
            .andExpect(jsonPath("$.data.role").value("USER"));
    }
}
