package com.javatheory.presentation;

import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.domain.Module;
import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Quiz;
import com.javatheory.domain.QuizResult;

import java.io.PrintStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Scanner;
import java.util.Set;

public class QuizRunner {

    private final QuizService quizService;
    private final ProgressService progressService;
    private final Scanner in;
    private final PrintStream out;

    public QuizRunner(QuizService quizService, ProgressService progressService, Scanner in, PrintStream out) {
        this.quizService = quizService;
        this.progressService = progressService;
        this.in = in;
        this.out = out;
    }

    public void run(Module module) {
        Quiz quiz = quizService.quizForModule(module.id())
                .orElseThrow(() -> new IllegalStateException("No quiz for module " + module.id()));
        out.println("=== Quiz: " + module.title() + " ===");
        List<Set<Integer>> answers = new ArrayList<>();
        List<Question> questions = quiz.questions();
        for (int i = 0; i < questions.size(); i++) {
            Question question = questions.get(i);
            out.printf("%d) %s%n", i + 1, question.text());
            for (int j = 0; j < question.options().size(); j++) {
                out.printf("   %d. %s%n", j + 1, question.options().get(j));
            }
            Set<Integer> selected = readAnswer(question);
            answers.add(selected);
            out.println(question.isCorrect(selected) ? "Correcto." : "Incorrecto.");
            out.println("Explicacion: " + question.explanation());
            out.println();
        }
        QuizResult result = quizService.evaluate(quiz, answers);
        progressService.recordResult(result);
        out.printf("Resultado: %d/%d (%d%%) - %s%n", result.score(), result.total(),
                percent(result.score(), result.total()),
                result.passed() ? "APROBADO" : "DESAPROBADO");
    }

    private Set<Integer> readAnswer(Question question) {
        if (question.type() == QuestionType.MULTIPLE) {
            out.print("Seleccione opciones separadas por coma (o '0' si ninguna): ");
        } else {
            out.print("Seleccione una opcion: ");
        }
        String line = in.nextLine().trim();
        Set<Integer> selected = new HashSet<>();
        if (line.isEmpty()) {
            return selected;
        }
        for (String part : line.split(",")) {
            part = part.trim();
            if (part.isEmpty()) {
                continue;
            }
            int value = safeInt(part) - 1;
            if (value >= 0 && value < question.options().size()) {
                selected.add(value);
            }
        }
        return selected;
    }

    private int percent(int score, int total) {
        if (total == 0) {
            return 0;
        }
        return (int) Math.round(score * 100.0 / total);
    }

    private int safeInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
