package com.javatheory.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.domain.LabExercise;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

public class LaboratoryService {

    private final ObjectMapper mapper;
    private List<LabExercise> exercises;

    public LaboratoryService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public List<LabExercise> listExercises() {
        if (exercises == null) {
            exercises = loadExercises();
        }
        return exercises;
    }

    public Optional<LabExercise> findById(String id) {
        return listExercises().stream()
                .filter(e -> e.id().equals(id))
                .findFirst();
    }

    private List<LabExercise> loadExercises() {
        try (InputStream is = getClass().getClassLoader()
                .getResourceAsStream("modules/laboratory.json")) {
            if (is == null) {
                return List.of();
            }
            return mapper.readValue(is, new TypeReference<>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to load laboratory exercises", e);
        }
    }
}
