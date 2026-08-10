package com.javatheory.web.dto;

public record QuestionFeedback(String questionId, boolean correct, String explanation) {
}
