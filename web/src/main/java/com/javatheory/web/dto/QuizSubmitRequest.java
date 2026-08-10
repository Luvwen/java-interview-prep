package com.javatheory.web.dto;

import java.util.List;

public record QuizSubmitRequest(String quizId, List<String> moduleIds, List<List<Integer>> answers, Integer durationSeconds) {
}
