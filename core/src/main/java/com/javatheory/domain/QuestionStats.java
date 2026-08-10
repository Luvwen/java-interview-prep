package com.javatheory.domain;

public record QuestionStats(int correct, int wrong, int streak) {

    public QuestionStats() {
        this(0, 0, 0);
    }

    public QuestionStats recordCorrect() {
        return new QuestionStats(correct + 1, wrong, streak + 1);
    }

    public QuestionStats recordWrong() {
        return new QuestionStats(correct, wrong + 1, 0);
    }

    public boolean needsReview() {
        return streak < 2;
    }
}
