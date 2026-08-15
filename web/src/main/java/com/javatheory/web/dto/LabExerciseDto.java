package com.javatheory.web.dto;

import com.javatheory.domain.LabExercise;

import java.util.List;

public record LabExerciseDto(String id, String title, String category, String difficulty,
                              String description, String theory, String code,
                              String expectedOutput, List<LabStepDto> steps) {

    public static LabExerciseDto fromExercise(LabExercise exercise) {
        List<LabStepDto> stepDtos = exercise.steps() != null
                ? exercise.steps().stream().map(LabStepDto::fromStep).toList()
                : List.of();
        return new LabExerciseDto(
                exercise.id(), exercise.title(), exercise.category(),
                exercise.difficulty(), exercise.description(), exercise.theory(),
                exercise.code(), exercise.expectedOutput(), stepDtos);
    }
}
