package com.javatheory.domain;

import java.util.List;

public record RealWorldCase(String id, String title, String category, String difficulty,
                            String problem, List<Section> sections,
                            List<String> keyPoints, List<String> interviewQuestions,
                            List<Exercise> exercises) {

    public record Section(String title, String text, String code) {
    }

    public record Exercise(String title, String description, List<String> hints,
                           ExerciseSolution solution) {
    }

    public record ExerciseSolution(List<ExerciseFile> files) {
    }

    public record ExerciseFile(String path, String code) {
    }
}
