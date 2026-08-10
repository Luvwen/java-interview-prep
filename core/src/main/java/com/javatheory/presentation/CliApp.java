package com.javatheory.presentation;

import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.domain.Module;

import java.io.PrintStream;
import java.util.List;
import java.util.Scanner;

public class CliApp {

    private final ModuleService moduleService;
    private final ProgressService progressService;
    private final Scanner in;
    private final PrintStream out;
    private final ModuleView moduleView;
    private final ProgressView progressView;
    private final QuizRunner quizRunner;

    public CliApp(ModuleService moduleService, QuizService quizService, ProgressService progressService,
                  Scanner in, PrintStream out) {
        this.moduleService = moduleService;
        this.progressService = progressService;
        this.in = in;
        this.out = out;
        this.moduleView = new ModuleView(out);
        this.progressView = new ProgressView(out);
        this.quizRunner = new QuizRunner(quizService, progressService, in, out);
    }

    public void run() {
        out.println("Bienvenido a Java Theory - preparacion para entrevistas tecnicas");
        boolean running = true;
        while (running) {
            out.println();
            out.println("=== Menu principal ===");
            out.println("1. Ver modulos");
            out.println("2. Ver progreso general");
            out.println("3. Salir");
            int option = readInt("Elija una opcion: ");
            switch (option) {
                case 1 -> moduleMenu();
                case 2 -> progressView.show(moduleService.listModules(), progressService);
                case 3 -> running = false;
                default -> out.println("Opcion invalida.");
            }
        }
    }

    private void moduleMenu() {
        List<Module> modules = moduleService.listModules();
        out.println();
        out.println("=== Modulos ===");
        for (int i = 0; i < modules.size(); i++) {
            Module module = modules.get(i);
            out.printf("%d. [%s] %s%n", i + 1, stateLabel(module.id()), module.title());
        }
        out.println("0. Volver");
        int option = readInt("Elija un modulo: ");
        if (option == 0) {
            return;
        }
        if (option < 1 || option > modules.size()) {
            out.println("Opcion invalida.");
            return;
        }
        moduleSubMenu(modules.get(option - 1));
    }

    private void moduleSubMenu(Module module) {
        boolean back = false;
        while (!back) {
            out.println();
            out.println("=== " + module.title() + " ===");
            out.println("1. Ver contenido");
            out.println("2. Resolver quiz");
            out.println("3. Marcar como completado");
            out.println("0. Volver");
            int option = readInt("Elija una opcion: ");
            switch (option) {
                case 1 -> moduleView.show(module);
                case 2 -> quizRunner.run(module);
                case 3 -> {
                    progressService.markCompleted(module.id());
                    out.println("Modulo marcado como completado.");
                }
                case 0 -> back = true;
                default -> out.println("Opcion invalida.");
            }
        }
    }

    private String stateLabel(String moduleId) {
        return switch (progressService.stateOf(moduleId)) {
            case PENDING -> "pendiente";
            case IN_PROGRESS -> "en curso";
            case COMPLETED -> "completado";
        };
    }

    private int readInt(String prompt) {
        out.print(prompt);
        String line = in.nextLine().trim();
        try {
            return Integer.parseInt(line);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
