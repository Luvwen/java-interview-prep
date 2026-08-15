package com.javatheory.domain;

import java.util.List;

public record LabExercise(String id, String title, String category, String difficulty,
                           String description, String theory, String code,
                           String expectedOutput, List<LabStep> steps) {
}
