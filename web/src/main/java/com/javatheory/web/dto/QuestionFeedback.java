package com.javatheory.web.dto;

import java.util.List;

public record QuestionFeedback(
        String questionId,
        String questionText,
        String questionType,
        boolean correct,
        String explanation,
        List<Integer> userAnswer,
        List<Integer> correctAnswer,
        List<String> options,
        List<String> userTextAnswer,
        List<String> correctTextAnswer
) {
}
