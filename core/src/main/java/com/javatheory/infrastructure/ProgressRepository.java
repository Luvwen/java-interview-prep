package com.javatheory.infrastructure;

import com.javatheory.domain.Progress;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class ProgressRepository {

    private static final Path DEFAULT_FILE =
            Path.of(System.getProperty("user.home"), ".javatheory", "progress.json");

    private final ObjectMapper mapper;
    private final Path file;

    public ProgressRepository(ObjectMapper mapper) {
        this(mapper, DEFAULT_FILE);
    }

    public ProgressRepository(ObjectMapper mapper, Path file) {
        this.mapper = mapper;
        this.file = file;
    }

    public Progress load() {
        if (!Files.exists(file)) {
            return new Progress();
        }
        try {
            return mapper.readValue(file.toFile(), Progress.class);
        } catch (IOException e) {
            throw new ProgressPersistenceException(e);
        }
    }

    public void save(Progress progress) {
        try {
            if (file.getParent() != null) {
                Files.createDirectories(file.getParent());
            }
            mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), progress);
        } catch (IOException e) {
            throw new ProgressPersistenceException(e);
        }
    }
}
