package com.javatheory.web.dto;

import java.util.List;
import java.util.Map;

public record QuizSubmitRequest(String quizId, List<String> moduleIds, List<List<Integer>> answers,
                                 Map<String, List<String>> textAnswers, Integer durationSeconds) {
}
