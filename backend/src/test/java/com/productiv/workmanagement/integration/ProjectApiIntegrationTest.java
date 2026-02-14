package com.productiv.workmanagement.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProjectApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    void createGetAndListWithPagination() throws Exception {
        String token = registerAndLogin("project_user@example.com", "password123", "Project User");

        String firstCreateBody = """
            {
              "name": "Project A",
              "description": "desc-a"
            }
            """;

        String firstCreateResponse = mockMvc.perform(post("/api/projects")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(firstCreateBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.name").value("Project A"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode firstJson = objectMapper.readTree(firstCreateResponse);
        String firstProjectId = firstJson.get("data").get("id").asText();

        String secondCreateBody = """
            {
              "name": "Project B",
              "description": "desc-b"
            }
            """;

        mockMvc.perform(post("/api/projects")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(secondCreateBody))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/projects/{id}", firstProjectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(firstProjectId))
            .andExpect(jsonPath("$.data.name").value("Project A"));

        mockMvc.perform(get("/api/projects?page=0&size=1&sort=createdAt,desc")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", hasSize(1)))
            .andExpect(jsonPath("$.meta.totalElements").value(2))
            .andExpect(jsonPath("$.meta.totalPages").value(2));
    }
}
