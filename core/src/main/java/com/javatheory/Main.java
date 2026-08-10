package com.javatheory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.infrastructure.ModuleLoader;
import com.javatheory.infrastructure.ProgressRepository;
import com.javatheory.presentation.CliApp;

import java.io.PrintStream;
import java.util.Scanner;

public final class Main {

    private Main() {
    }

    public static void main(String[] args) {
        ObjectMapper mapper = new ObjectMapper();
        ModuleService moduleService = new ModuleService(new ModuleLoader(mapper));
        QuizService quizService = new QuizService(moduleService);
        ProgressService progressService = new ProgressService(new ProgressRepository(mapper));
        Scanner in = new Scanner(System.in);
        PrintStream out = System.out;
        new CliApp(moduleService, quizService, progressService, in, out).run();
    }
}
