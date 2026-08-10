package com.javatheory.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.ModuleState;
import com.javatheory.domain.Progress;
import com.javatheory.domain.QuizResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProgressRepositoryTest {

    @TempDir
    Path tempDir;

    private Path file;
    private ProgressRepository repository;

    @BeforeEach
    void setUp() {
        file = tempDir.resolve("progress.json");
        repository = new ProgressRepository(new ObjectMapper(), file);
    }

    @AfterEach
    void tearDown() throws Exception {
        Files.deleteIfExists(file);
    }

    @Test
    void loadReturnsEmptyProgressWhenFileMissing() {
        Progress progress = repository.load();
        assertTrue(progress.moduleStates().isEmpty());
        assertTrue(progress.quizResults().isEmpty());
    }

    @Test
    void saveAndLoadRoundTripPreservesData() {
        Progress progress = new Progress();
        progress.setState("m1", ModuleState.COMPLETED);
        progress.setState("m2", ModuleState.IN_PROGRESS);
        progress.recordResult(QuizResult.of("m1", 2, 3, true));

        repository.save(progress);
        Progress loaded = repository.load();

        assertEquals(ModuleState.COMPLETED, loaded.stateOf("m1"));
        assertEquals(ModuleState.IN_PROGRESS, loaded.stateOf("m2"));
        assertEquals(1, loaded.quizResults().size());
        assertEquals("m1", loaded.quizResults().get(0).quizId());
        assertTrue(loaded.quizResults().get(0).passed());
    }

    @Test
    void saveCreatesParentDirectories() {
        Path nested = tempDir.resolve("nested").resolve("dir").resolve("progress.json");
        ProgressRepository nestedRepo = new ProgressRepository(new ObjectMapper(), nested);
        nestedRepo.save(new Progress());
        assertTrue(Files.exists(nested));
    }
}
