package com.javatheory.web.controller;

import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.web.dto.ModuleDetail;
import com.javatheory.web.dto.ModuleSummary;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService moduleService;
    private final ProgressService progressService;

    public ModuleController(ModuleService moduleService, ProgressService progressService) {
        this.moduleService = moduleService;
        this.progressService = progressService;
    }

    @GetMapping
    public List<ModuleSummary> list() {
        return moduleService.listModules().stream()
                .map(module -> new ModuleSummary(module.id(), module.title(), module.description(),
                        progressService.stateOf(module.id())))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleDetail> detail(@PathVariable("id") String id) {
        return moduleService.findById(id)
                .map(module -> ResponseEntity.ok(
                        new ModuleDetail(module.id(), module.title(), module.description(), module.topics())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable("id") String id) {
        if (moduleService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        progressService.markCompleted(id);
        return ResponseEntity.noContent().build();
    }
}
