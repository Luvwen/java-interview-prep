package com.javatheory.domain;

import java.time.LocalDate;

public record QuizResult(String quizId, int score, int total, boolean passed, String date) {

    public static QuizResult of(String quizId, int score, int total, boolean passed) {
        return new QuizResult(quizId, score, total, passed, LocalDate.now().toString());
    }
}
