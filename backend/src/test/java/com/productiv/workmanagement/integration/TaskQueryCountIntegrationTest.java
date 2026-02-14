package com.productiv.workmanagement.integration;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TaskQueryCountIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Test
    void taskListQueryCountShouldNotGrowLinearlyWithTaskCount() throws Exception {
        String token = registerAndLogin("n1_user@example.com", "password123", "N1 User");

        String projectBody = """
            {
              "name": "N1 Project",
              "description": "n+1 check"
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

        JsonNode projectJson = objectMapper.readTree(projectResponse);
        String projectId = projectJson.get("data").get("id").asText();

        createTask(token, projectId, "Task-1");

        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();

        statistics.clear();
        mockMvc.perform(get("/api/projects/{projectId}/tasks", projectId)
                .queryParam("page", "0")
                .queryParam("size", "50")
                .queryParam("sort", "createdAt,desc")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk());
        long oneTaskQueryCount = statistics.getPrepareStatementCount();

        createTask(token, projectId, "Task-2");
        createTask(token, projectId, "Task-3");
        createTask(token, projectId, "Task-4");
        createTask(token, projectId, "Task-5");

        statistics.clear();
        mockMvc.perform(get("/api/projects/{projectId}/tasks", projectId)
                .queryParam("page", "0")
                .queryParam("size", "50")
                .queryParam("sort", "createdAt,desc")
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk());
        long fiveTaskQueryCount = statistics.getPrepareStatementCount();

        assertThat(fiveTaskQueryCount)
            .as("query count should remain near-constant when task count grows")
            .isLessThanOrEqualTo(oneTaskQueryCount + 3);
    }

    private void createTask(String token, String projectId, String title) throws Exception {
        String taskBody = """
            {
              "title": "%s",
              "description": "task for n+1",
              "status": "TODO",
              "priority": "HIGH",
              "dueDate": "2030-12-31"
            }
            """.formatted(title);

        mockMvc.perform(post("/api/projects/{projectId}/tasks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(taskBody))
            .andExpect(status().isCreated());
    }
}
