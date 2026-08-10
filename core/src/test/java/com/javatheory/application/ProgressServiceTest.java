package com.javatheory.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.Attempt;
import com.javatheory.domain.ModuleState;
import com.javatheory.domain.QuizMode;
import com.javatheory.domain.QuizResult;
import com.javatheory.infrastructure.ProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProgressServiceTest {

    @TempDir
    Path tempDir;

    private ProgressService service;

    @BeforeEach
    void setUp() {
        ProgressRepository repository = new ProgressRepository(new ObjectMapper(), tempDir.resolve("progress.json"));
        service = new ProgressService(repository);
    }

    @Test
    void markInProgressSetsState() {
        service.markInProgress("m1");
        assertEquals(ModuleState.IN_PROGRESS, service.stateOf("m1"));
    }

    @Test
    void markCompletedSetsState() {
        service.markCompleted("m1");
        assertEquals(ModuleState.COMPLETED, service.stateOf("m1"));
    }

    @Test
    void passingQuizMarksModuleCompleted() {
        service.recordResult(QuizResult.of("m1", 3, 3, true));
        assertEquals(ModuleState.COMPLETED, service.stateOf("m1"));
    }

    @Test
    void failingQuizDoesNotCompleteModule() {
        service.markInProgress("m1");
        service.recordResult(QuizResult.of("m1", 1, 3, false));
        assertEquals(ModuleState.IN_PROGRESS, service.stateOf("m1"));
    }

    @Test
    void failingQuizOnPendingModuleMarksItInProgress() {
        service.recordResult(QuizResult.of("m1", 1, 3, false));
        assertEquals(ModuleState.IN_PROGRESS, service.stateOf("m1"));
    }

    @Test
    void progressPersistsAcrossServiceInstances() {
        service.markCompleted("m1");
        ProgressRepository repository = new ProgressRepository(new ObjectMapper(), tempDir.resolve("progress.json"));
        ProgressService reloaded = new ProgressService(repository);
        assertEquals(ModuleState.COMPLETED, reloaded.stateOf("m1"));
        assertEquals(100, reloaded.overallPercent(1));
    }

    @Test
    void recordQuestionCorrectIncreasesStreak() {
        service.recordQuestionStats("q1", true);
        service.recordQuestionStats("q1", true);
        assertEquals(2, service.progress().statsOf("q1").correct());
        assertEquals(2, service.progress().statsOf("q1").streak());
    }

    @Test
    void recordQuestionWrongResetsStreak() {
        service.recordQuestionStats("q1", true);
        service.recordQuestionStats("q1", true);
        service.recordQuestionStats("q1", false);
        assertEquals(2, service.progress().statsOf("q1").correct());
        assertEquals(0, service.progress().statsOf("q1").streak());
    }

    @Test
    void recordAttemptAppends() {
        Attempt attempt = Attempt.of("quiz-1", QuizMode.MIXED, List.of("m1"), 5, 8, true);
        service.recordAttempt(attempt);
        assertEquals(1, service.attempts().size());
        assertEquals(QuizMode.MIXED, service.attempts().get(0).mode());
    }

    @Test
    void resetClearsAllState() {
        service.markCompleted("m1");
        service.recordQuestionStats("q1", true);
        service.recordAttempt(Attempt.of("quiz-1", QuizMode.NORMAL, List.of("m1"), 3, 3, true));
        service.reset();
        assertEquals(0, service.questionStats().size());
        assertEquals(0, service.attempts().size());
        assertEquals(ModuleState.PENDING, service.stateOf("m1"));
    }
}
