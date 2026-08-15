package com.javatheory.web.controller;

import com.javatheory.application.LaboratoryService;
import com.javatheory.domain.LabExercise;
import com.javatheory.web.dto.LabExerciseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @GetMapping
    public ResponseEntity<List<LabExerciseDto>> listExercises() {
        List<LabExerciseDto> exercises = laboratoryService.listExercises().stream()
                .map(LabExerciseDto::fromExercise)
                .toList();
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabExerciseDto> getExercise(@PathVariable String id) {
        return laboratoryService.findById(id)
                .map(LabExerciseDto::fromExercise)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
