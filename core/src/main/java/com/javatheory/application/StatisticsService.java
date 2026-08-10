package com.javatheory.application;

import com.javatheory.domain.Attempt;
import com.javatheory.domain.Module;
import com.javatheory.domain.QuestionStats;
import com.javatheory.domain.QuizMode;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class StatisticsService {

    private final ModuleService moduleService;
    private final ProgressService progressService;

    public StatisticsService(ModuleService moduleService, ProgressService progressService) {
        this.moduleService = moduleService;
        this.progressService = progressService;
    }

    public Map<String, ModuleStats> statsByModule() {
        Map<String, ModuleStats> result = new LinkedHashMap<>();
        List<Module> modules = moduleService.listModules();

        for (Module module : modules) {
            String moduleId = module.id();
            int totalCorrect = 0;
            int totalWrong = 0;
            int bestScore = 0;
            int totalAttempts = 0;
            int totalTime = 0;

            for (Attempt attempt : progressService.attempts()) {
                if (attempt.moduleIds().contains(moduleId) && attempt.mode() != QuizMode.ERROR_REVIEW) {
                    totalAttempts++;
                    totalCorrect += attempt.score();
                    totalWrong += (attempt.total() - attempt.score());
                    bestScore = Math.max(bestScore, attempt.total() > 0 ? (attempt.score() * 100) / attempt.total() : 0);
                    totalTime += attempt.durationSeconds();
                }
            }

            int total = totalCorrect + totalWrong;
            int avgPercent = total > 0 ? (totalCorrect * 100) / total : 0;
            int avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

            result.put(moduleId, new ModuleStats(moduleId, module.title(),
                    totalCorrect, totalWrong, bestScore, avgPercent, avgTime, totalAttempts));
        }
        return result;
    }

    public record ModuleStats(String moduleId, String title, int correct, int wrong,
                               int bestPercent, int avgPercent, int avgTimeSeconds, int attempts) {
    }
}
