package com.javatheory.web.dto;

import java.util.List;

public record QuizResultResponse(int score, int total, boolean passed, List<QuestionFeedback> feedback) {
}
