package com.productiv.workmanagement.integration;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RiskApiIntegrationTest extends AbstractIntegrationTest {

    @Test
    void createRiskAfterProjectCreation() throws Exception {
        String token = registerAndLogin("risk_create_user@example.com", "password123", "Risk User");
        String projectId = createProject(token, "Risk Project A");

        mockMvc.perform(post("/api/projects/{projectId}/risks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Vendor outage risk",
                      "description": "Third-party API downtime",
                      "status": "IDENTIFIED",
                      "probability": 4,
                      "impact": 5
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.title").value("Vendor outage risk"))
            .andExpect(jsonPath("$.data.status").value("IDENTIFIED"))
            .andExpect(jsonPath("$.data.levelScore").value(20))
            .andExpect(jsonPath("$.data.levelBucket").value("CRITICAL"));
    }

    @Test
    void listRiskWithStatusAndLevelBucketFilters() throws Exception {
        String token = registerAndLogin("risk_filter_user@example.com", "password123", "Risk Filter User");
        String projectId = createProject(token, "Risk Project B");

        String criticalRiskId = createRisk(token, projectId, "Critical Risk", "ASSESSING", (short) 5, (short) 5);
        createRisk(token, projectId, "Medium Monitoring Risk", "MONITORING", (short) 2, (short) 3);

        mockMvc.perform(get("/api/projects/{projectId}/risks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .queryParam("status", "ASSESSING")
                .queryParam("levelBucket", "CRITICAL")
                .queryParam("page", "0")
                .queryParam("size", "10")
                .queryParam("sort", "createdAt,desc"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", hasSize(1)))
            .andExpect(jsonPath("$.data[0].id").value(criticalRiskId))
            .andExpect(jsonPath("$.data[0].status").value("ASSESSING"))
            .andExpect(jsonPath("$.data[0].levelBucket").value("CRITICAL"));
    }

    @Test
    void patchProbabilityImpactShouldRecalculateLevelScore() throws Exception {
        String token = registerAndLogin("risk_patch_user@example.com", "password123", "Risk Patch User");
        String projectId = createProject(token, "Risk Project C");
        String riskId = createRisk(token, projectId, "Patchable Risk", "IDENTIFIED", (short) 1, (short) 2);

        mockMvc.perform(patch("/api/risks/{riskId}", riskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "probability": 4,
                      "impact": 3
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(riskId))
            .andExpect(jsonPath("$.data.probability").value(4))
            .andExpect(jsonPath("$.data.impact").value(3))
            .andExpect(jsonPath("$.data.levelScore").value(12))
            .andExpect(jsonPath("$.data.levelBucket").value("HIGH"));
    }

    @Test
    void createAndCompleteRiskAction() throws Exception {
        String token = registerAndLogin("risk_action_user@example.com", "password123", "Risk Action User");
        String projectId = createProject(token, "Risk Project D");
        String riskId = createRisk(token, projectId, "Action Risk", "MITIGATING", (short) 3, (short) 4);

        String actionResponse = mockMvc.perform(post("/api/risks/{riskId}/actions", riskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Prepare fallback plan",
                      "description": "Create rollback checklist",
                      "status": "OPEN"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.title").value("Prepare fallback plan"))
            .andExpect(jsonPath("$.data.status").value("OPEN"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        String actionId = objectMapper.readTree(actionResponse).get("data").get("id").asText();

        mockMvc.perform(patch("/api/risk-actions/{actionId}", actionId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "status": "DONE"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(actionId))
            .andExpect(jsonPath("$.data.status").value("DONE"));
    }

    @Test
    void closeRisk() throws Exception {
        String token = registerAndLogin("risk_close_user@example.com", "password123", "Risk Close User");
        String projectId = createProject(token, "Risk Project E");
        String riskId = createRisk(token, projectId, "Closable Risk", "MONITORING", (short) 3, (short) 3);

        mockMvc.perform(post("/api/risks/{riskId}/close", riskId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(riskId))
            .andExpect(jsonPath("$.data.status").value("CLOSED"))
            .andExpect(jsonPath("$.data.closedAt").isNotEmpty());
    }

    private String createProject(String token, String name) throws Exception {
        String projectResponse = mockMvc.perform(post("/api/projects")
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "%s",
                      "description": "integration project"
                    }
                    """.formatted(name)))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode projectJson = objectMapper.readTree(projectResponse);
        return projectJson.get("data").get("id").asText();
    }

    private String createRisk(
        String token,
        String projectId,
        String title,
        String status,
        short probability,
        short impact
    ) throws Exception {
        String riskResponse = mockMvc.perform(post("/api/projects/{projectId}/risks", projectId)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "%s",
                      "description": "risk for integration test",
                      "status": "%s",
                      "probability": %d,
                      "impact": %d
                    }
                    """.formatted(title, status, probability, impact)))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode riskJson = objectMapper.readTree(riskResponse);
        return riskJson.get("data").get("id").asText();
    }
}
