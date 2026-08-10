package com.javatheory.web.dto;

import java.util.List;

public record QuizResponse(String id, List<QuizQuestionDto> questions) {
}
