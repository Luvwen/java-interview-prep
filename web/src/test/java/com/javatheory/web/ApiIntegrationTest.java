package com.javatheory.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("javatheory.progress",
                () -> "target/test-progress/progress.json");
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsAllModules() throws Exception {
        mockMvc.perform(get("/api/modules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(13)))
                .andExpect(jsonPath("$[0].id").value("core-java"))
                .andExpect(jsonPath("$[0].state").isNotEmpty());
    }

    @Test
    void returnsModuleDetail() throws Exception {
        mockMvc.perform(get("/api/modules/poo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("POO"))
                .andExpect(jsonPath("$.topics", hasSize(7)));
    }

    @Test
    void returnsModuleNotFound() throws Exception {
        mockMvc.perform(get("/api/modules/unknown"))
                .andExpect(status().isNotFound());
    }

    @Test
    void quizResponseIncludesCorrectIndexes() throws Exception {
        mockMvc.perform(get("/api/modules/core-java/quiz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].correctIndexes").isArray())
                .andExpect(jsonPath("$.questions[?(@.type=='TRUE_FALSE')]").isNotEmpty())
                .andExpect(jsonPath("$.questions[?(@.type=='ORDER')]").isNotEmpty());
    }

    @Test
    void submitsQuizAndReturnsFeedback() throws Exception {
        String body = """
                {"answers": [[1], [0], [0, 1, 3], [1], [0], [1], [0, 1, 2, 3], [1], [0], [1], [0, 1, 2, 3], [2], [2], [0], [0], [0]]}
                """;
        mockMvc.perform(post("/api/modules/core-java/quiz")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").isNumber())
                .andExpect(jsonPath("$.total").value(16))
                .andExpect(jsonPath("$.feedback", hasSize(16)));
    }

    @Test
    void marksModuleAsCompleted() throws Exception {
        mockMvc.perform(post("/api/modules/core-java/complete"))
                .andExpect(status().isNoContent());
    }

    @Test
    void completingUnknownModuleReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/modules/unknown/complete"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsProgress() throws Exception {
        mockMvc.perform(get("/api/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moduleStates").isNotEmpty())
                .andExpect(jsonPath("$.overallPercent").isNumber());
    }

    @Test
    void resetProgressClearsAllStates() throws Exception {
        mockMvc.perform(post("/api/modules/core-java/complete"))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/progress"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moduleStates").isEmpty())
                .andExpect(jsonPath("$.overallPercent").value(0));
    }

    @Test
    void mixedQuizReturnsQuestionsFromSelectedModules() throws Exception {
        String body = """
                {"moduleIds": ["core-java", "poo"], "count": 4}
                """;
        mockMvc.perform(post("/api/quiz/mixed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isString())
                .andExpect(jsonPath("$.questions", hasSize(4)))
                .andExpect(jsonPath("$.questions[0].text").isNotEmpty());
    }

    @Test
    void mixedQuizFailsWithZeroCount() throws Exception {
        String body = """
                {"moduleIds": ["core-java"], "count": 0}
                """;
        mockMvc.perform(post("/api/quiz/mixed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void errorReviewQuizReturnsEmptyWhenNoErrors() throws Exception {
        mockMvc.perform(delete("/api/progress"));

        mockMvc.perform(post("/api/quiz/errors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitMixedQuizRecordsStatsAndAttempt() throws Exception {
        String mixedBody = """
                {"moduleIds": ["core-java"], "count": 2}
                """;
        String quizId = mockMvc.perform(post("/api/quiz/mixed")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mixedBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String id = com.jayway.jsonpath.JsonPath.read(quizId, "$.id");

        String submitBody = String.format("""
                {"quizId": "%s", "moduleIds": ["core-java"], "answers": [[0], [0]]}
                """, id);
        mockMvc.perform(post("/api/quiz/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(submitBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").isNumber())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.feedback", hasSize(2)));

        mockMvc.perform(get("/api/progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attempts").isArray())
                .andExpect(jsonPath("$.attempts[0].mode").value("MIXED"));
    }
}
