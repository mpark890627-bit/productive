package com.productiv.workmanagement.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TaskApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    void createPatchStatusAndFilterSearch() throws Exception {
        String token = registerAndLogin("task_user@example.com", "password123", "Task User");

        String projectBody = """
            {
              "name": "Task Project",
              "description": "project for task test"
            }
            """;

        String projectResponse = mockMvc.perform(post("/api/projects")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(projectBody))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String projectId = objectMapper.readTree(projectResponse).get("data").get("id").asText();

        String taskBody = """
            {
              "title": "Implement Task API",
              "description": "implement create and patch",
              "status": "TODO",
              "priority": "HIGH",
              "dueDate": "2030-12-31"
            }
            """;

        String taskResponse = mockMvc.perform(post("/api/projects/{projectId}/tasks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.status").value("TODO"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode taskJson = objectMapper.readTree(taskResponse);
        String taskId = taskJson.get("data").get("id").asText();

        String patchBody = """
            {
              "status": "IN_PROGRESS"
            }
            """;

        mockMvc.perform(patch("/api/tasks/{id}", taskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(patchBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(taskId))
            .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        mockMvc.perform(get("/api/projects/{projectId}/tasks", projectId)
                .queryParam("status", "IN_PROGRESS")
                .queryParam("keyword", "implement")
                .queryParam("page", "0")
                .queryParam("size", "10")
                .queryParam("sort", "createdAt,desc")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", hasSize(1)))
            .andExpect(jsonPath("$.data[0].id").value(taskId))
            .andExpect(jsonPath("$.data[0].status").value("IN_PROGRESS"));
    }

    @Test
    void nonOwnerCannotAccessTaskByIdEndpoints() throws Exception {
        String ownerToken = registerAndLogin("owner_user@example.com", "password123", "Owner");
        String otherToken = registerAndLogin("other_user@example.com", "password123", "Other");

        String projectBody = """
            {
              "name": "Owner Project",
              "description": "owner only project"
            }
            """;

        String projectResponse = mockMvc.perform(post("/api/projects")
                .header(HttpHeaders.AUTHORIZATION, bearer(ownerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(projectBody))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String projectId = objectMapper.readTree(projectResponse).get("data").get("id").asText();

        String taskBody = """
            {
              "title": "Owner Task",
              "description": "restricted",
              "status": "TODO",
              "priority": "HIGH",
              "dueDate": "2030-12-31"
            }
            """;

        String taskResponse = mockMvc.perform(post("/api/projects/{projectId}/tasks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(ownerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskBody))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String taskId = objectMapper.readTree(taskResponse).get("data").get("id").asText();

        mockMvc.perform(get("/api/tasks/{id}", taskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
            .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/tasks/{id}", taskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(otherToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"IN_PROGRESS\"}"))
            .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/tasks/{id}", taskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(otherToken)))
            .andExpect(status().isNotFound());
    }
}
