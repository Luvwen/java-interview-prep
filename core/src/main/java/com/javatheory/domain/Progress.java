package com.javatheory.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public record Progress(Map<String, ModuleState> moduleStates, List<QuizResult> quizResults,
                       Map<String, QuestionStats> questionStats, List<Attempt> attempts,
                       Streak streak) {

    public Progress {
        if (moduleStates == null) moduleStates = new LinkedHashMap<>();
        if (quizResults == null) quizResults = new ArrayList<>();
        if (questionStats == null) questionStats = new LinkedHashMap<>();
        if (attempts == null) attempts = new ArrayList<>();
        if (streak == null) streak = new Streak();
    }

    public Progress() {
        this(new LinkedHashMap<>(), new ArrayList<>(), new LinkedHashMap<>(), new ArrayList<>(), new Streak());
    }

    public ModuleState stateOf(String moduleId) {
        return moduleStates.getOrDefault(moduleId, ModuleState.PENDING);
    }

    public void setState(String moduleId, ModuleState state) {
        moduleStates.put(moduleId, state);
    }

    public void recordResult(QuizResult result) {
        quizResults.add(result);
    }

    public QuestionStats statsOf(String questionId) {
        return questionStats.getOrDefault(questionId, new QuestionStats());
    }

    public void recordQuestionCorrect(String questionId) {
        QuestionStats current = statsOf(questionId);
        questionStats.put(questionId, current.recordCorrect());
    }

    public void recordQuestionWrong(String questionId) {
        QuestionStats current = statsOf(questionId);
        questionStats.put(questionId, current.recordWrong());
    }

    public void addAttempt(Attempt attempt) {
        attempts.add(attempt);
    }

    public int overallPercent(int totalModules) {
        if (totalModules <= 0) {
            return 0;
        }
        long completed = moduleStates.values().stream()
                .filter(state -> state == ModuleState.COMPLETED)
                .count();
        return (int) Math.round((completed * 100.0) / totalModules);
    }
}
