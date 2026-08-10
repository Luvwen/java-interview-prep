package com.javatheory.web.dto;

import com.javatheory.domain.QuestionType;

import java.util.List;

public record QuizQuestionDto(String id, String text, List<String> options, QuestionType type) {
}
