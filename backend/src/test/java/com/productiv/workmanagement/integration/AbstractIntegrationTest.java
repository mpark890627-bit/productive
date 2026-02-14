package com.productiv.workmanagement.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    private static PostgreSQLContainer<?> postgres;

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        boolean useTestcontainers = isUseTestcontainers();

        if (useTestcontainers) {
            if (postgres == null) {
                postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("work_management_test")
                    .withUsername("test")
                    .withPassword("test");
                postgres.start();
            }
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        } else {
            registry.add("spring.datasource.url", () -> readConfig("test.db.url", "TEST_DB_URL", "jdbc:postgresql://localhost:55432/work_management"));
            registry.add("spring.datasource.username", () -> readConfig("test.db.username", "TEST_DB_USERNAME", "wm_user"));
            registry.add("spring.datasource.password", () -> readConfig("test.db.password", "TEST_DB_PASSWORD", "wm_password"));
        }

        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("app.jwt.secret", () -> "integration-test-jwt-secret-key-12345678901234567890");
        registry.add("app.jwt.access-token-expiration-ms", () -> "3600000");
    }

    private static boolean isUseTestcontainers() {
        String value = readConfig("useTestcontainers", "USE_TESTCONTAINERS", "true");
        return Boolean.parseBoolean(value);
    }

    private static String readConfig(String systemProperty, String envVar, String defaultValue) {
        String propertyValue = System.getProperty(systemProperty);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }
        String envValue = System.getenv(envVar);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }
        return defaultValue;
    }

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("TRUNCATE TABLE activity_logs, comments, task_tags, tasks, tags, projects, users CASCADE");
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String registerAndLogin(String email, String password, String name) throws Exception {
        String registerBody = """
            {
              "email": "%s",
              "password": "%s",
              "name": "%s"
            }
            """.formatted(email, password, name);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
            .andExpect(status().isCreated());

        String loginBody = """
            {
              "email": "%s",
              "password": "%s"
            }
            """.formatted(email, password);

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(loginResponse);
        return jsonNode.get("data").get("accessToken").asText();
    }
}
