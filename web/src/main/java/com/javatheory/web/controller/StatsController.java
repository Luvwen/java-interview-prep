package com.javatheory.web.controller;

import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.application.StatisticsService;
import com.javatheory.domain.Streak;
import com.javatheory.web.dto.QuizResponse;
import com.javatheory.web.dto.QuizQuestionDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final StatisticsService statisticsService;
    private final ProgressService progressService;
    private final QuizService quizService;

    public StatsController(StatisticsService statisticsService, ProgressService progressService,
                            QuizService quizService) {
        this.statisticsService = statisticsService;
        this.progressService = progressService;
        this.quizService = quizService;
    }

    @GetMapping("/stats")
    public Map<String, StatisticsService.ModuleStats> stats() {
        return statisticsService.statsByModule();
    }

    @GetMapping("/streak")
    public Streak streak() {
        return progressService.streak();
    }

    @PostMapping("/streak/daily")
    public ResponseEntity<Void> recordDailyStreak() {
        progressService.recordStreakDay();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quiz/daily")
    public ResponseEntity<QuizResponse> dailyChallenge() {
        List<String> moduleIds = List.of("core-java", "poo", "collections", "streams",
                "concurrency", "jvm", "sql-jdbc", "spring", "testing",
                "design-patterns", "rest-http", "git");

        long seed = java.time.LocalDate.now().toEpochDay();
        java.util.Random random = new java.util.Random(seed);

        var quizOpt = quizService.mixedQuiz(moduleIds, 5);
        return quizOpt.map(quiz -> {
            List<QuizQuestionDto> questions = quiz.questions().stream()
                    .map(q -> new QuizQuestionDto(q.id(), q.text(), q.options(), q.type(),
                            q.codeTemplate(), q.blanks(), q.code(),
                            q.difficulty(), q.moduleId(), q.correctIndexes()))
                    .toList();
            return ResponseEntity.ok(new QuizResponse("daily-" + java.time.LocalDate.now(), questions));
        }).orElseGet(() -> ResponseEntity.badRequest().build());
    }
}
