package com.javatheory.domain;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProgressTest {

    @Test
    void defaultStateIsPending() {
        Progress progress = new Progress();
        assertEquals(ModuleState.PENDING, progress.stateOf("m1"));
    }

    @Test
    void stateCanBeSetAndRead() {
        Progress progress = new Progress();
        progress.setState("m1", ModuleState.IN_PROGRESS);
        assertEquals(ModuleState.IN_PROGRESS, progress.stateOf("m1"));
    }

    @Test
    void overallPercentCountsOnlyCompletedModules() {
        Progress progress = new Progress();
        progress.setState("m1", ModuleState.COMPLETED);
        progress.setState("m2", ModuleState.IN_PROGRESS);
        assertEquals(50, progress.overallPercent(2));
        progress.setState("m2", ModuleState.COMPLETED);
        assertEquals(100, progress.overallPercent(2));
    }

    @Test
    void overallPercentIsZeroWithoutModules() {
        assertEquals(0, new Progress().overallPercent(0));
    }

    @Test
    void recordResultAddsToResults() {
        Progress progress = new Progress();
        QuizResult result = QuizResult.of("m1", 3, 3, true);
        progress.recordResult(result);
        assertEquals(List.of(result), progress.quizResults());
    }

    @Test
    void questionStatsStartAtZero() {
        Progress progress = new Progress();
        assertEquals(0, progress.statsOf("q1").correct());
        assertEquals(0, progress.statsOf("q1").wrong());
        assertEquals(0, progress.statsOf("q1").streak());
    }

    @Test
    void recordQuestionCorrectIncrementsStats() {
        Progress progress = new Progress();
        progress.recordQuestionCorrect("q1");
        progress.recordQuestionCorrect("q1");
        QuestionStats stats = progress.statsOf("q1");
        assertEquals(2, stats.correct());
        assertEquals(0, stats.wrong());
        assertEquals(2, stats.streak());
    }

    @Test
    void recordQuestionWrongResetsStreak() {
        Progress progress = new Progress();
        progress.recordQuestionCorrect("q1");
        progress.recordQuestionCorrect("q1");
        progress.recordQuestionWrong("q1");
        QuestionStats stats = progress.statsOf("q1");
        assertEquals(2, stats.correct());
        assertEquals(1, stats.wrong());
        assertEquals(0, stats.streak());
    }

    @Test
    void addAttemptAppendsToList() {
        Progress progress = new Progress();
        Attempt attempt = Attempt.of("quiz-1", QuizMode.MIXED, List.of("m1", "m2"), 5, 8, true);
        progress.addAttempt(attempt);
        assertEquals(1, progress.attempts().size());
        assertEquals("quiz-1", progress.attempts().get(0).quizId());
    }

    @Test
    void needsReviewWhenStreakBelowTwo() {
        assertTrue(new QuestionStats(1, 0, 1).needsReview());
        assertTrue(new QuestionStats(0, 0, 0).needsReview());
    }
}
