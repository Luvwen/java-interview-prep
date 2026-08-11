package com.javatheory.web.dto;

import com.javatheory.domain.QuestionType;

import java.util.List;

public record QuizQuestionDto(String id, String text, List<String> options, QuestionType type,
                               String codeTemplate, List<String> blanks, String code) {

    public QuizQuestionDto(String id, String text, List<String> options, QuestionType type) {
        this(id, text, options, type, null, null, null);
    }
}
