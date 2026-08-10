package com.javatheory.web.controller;

import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.web.dto.ProgressResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final ModuleService moduleService;

    public ProgressController(ProgressService progressService, ModuleService moduleService) {
        this.progressService = progressService;
        this.moduleService = moduleService;
    }

    @GetMapping
    public ProgressResponse get() {
        return new ProgressResponse(
                progressService.progress().moduleStates(),
                progressService.overallPercent(moduleService.listModules().size()),
                progressService.questionStats(),
                progressService.attempts(),
                progressService.streak());
    }

    @DeleteMapping
    public ResponseEntity<Void> reset() {
        progressService.reset();
        return ResponseEntity.noContent().build();
    }
}
