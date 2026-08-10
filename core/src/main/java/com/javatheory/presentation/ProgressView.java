package com.javatheory.presentation;

import com.javatheory.application.ProgressService;
import com.javatheory.domain.Module;
import com.javatheory.domain.ModuleState;

import java.io.PrintStream;
import java.util.List;

public class ProgressView {

    private final PrintStream out;

    public ProgressView(PrintStream out) {
        this.out = out;
    }

    public void show(List<Module> modules, ProgressService progressService) {
        out.println("=== Progreso general ===");
        for (Module module : modules) {
            out.printf("- %s: %s%n", module.title(), label(progressService.stateOf(module.id())));
        }
        out.printf("Avance global: %d%%%n", progressService.overallPercent(modules.size()));
    }

    private String label(ModuleState state) {
        return switch (state) {
            case PENDING -> "pendiente";
            case IN_PROGRESS -> "en curso";
            case COMPLETED -> "completado";
        };
    }
}
