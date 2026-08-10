package com.javatheory.domain;

import java.time.LocalDate;
import java.util.List;

public record Attempt(String quizId, QuizMode mode, List<String> moduleIds,
                      int score, int total, boolean passed, int durationSeconds, String date) {

    public static Attempt of(String quizId, QuizMode mode, List<String> moduleIds,
                             int score, int total, boolean passed) {
        return new Attempt(quizId, mode, moduleIds, score, total, passed, 0, LocalDate.now().toString());
    }

    public static Attempt of(String quizId, QuizMode mode, List<String> moduleIds,
                             int score, int total, boolean passed, int durationSeconds) {
        return new Attempt(quizId, mode, moduleIds, score, total, passed, durationSeconds, LocalDate.now().toString());
    }
}
