package com.javatheory.application;

import com.javatheory.domain.Attempt;
import com.javatheory.domain.ModuleState;
import com.javatheory.domain.Progress;
import com.javatheory.domain.QuestionStats;
import com.javatheory.domain.QuizResult;
import com.javatheory.domain.Streak;
import com.javatheory.infrastructure.ProgressRepository;

import java.util.List;
import java.util.Map;

public class ProgressService {

    private final ProgressRepository repository;
    private Progress progress;

    public ProgressService(ProgressRepository repository) {
        this.repository = repository;
        this.progress = repository.load();
    }

    public Progress progress() {
        return progress;
    }

    public ModuleState stateOf(String moduleId) {
        return progress.stateOf(moduleId);
    }

    public List<QuizResult> results() {
        return progress.quizResults();
    }

    public void markInProgress(String moduleId) {
        progress.setState(moduleId, ModuleState.IN_PROGRESS);
        repository.save(progress);
    }

    public void markCompleted(String moduleId) {
        progress.setState(moduleId, ModuleState.COMPLETED);
        repository.save(progress);
    }

    public void reset() {
        progress = new Progress();
        repository.save(progress);
    }

    public void recordResult(QuizResult result) {
        progress.recordResult(result);
        if (result.passed()) {
            progress.setState(result.quizId(), ModuleState.COMPLETED);
        } else if (progress.stateOf(result.quizId()) == ModuleState.PENDING) {
            progress.setState(result.quizId(), ModuleState.IN_PROGRESS);
        }
        repository.save(progress);
    }

    public void recordQuestionStats(String questionId, boolean correct) {
        if (correct) {
            progress.recordQuestionCorrect(questionId);
        } else {
            progress.recordQuestionWrong(questionId);
        }
    }

    public void recordAttempt(Attempt attempt) {
        progress.addAttempt(attempt);
        repository.save(progress);
    }

    public void save() {
        repository.save(progress);
    }

    public Map<String, QuestionStats> questionStats() {
        return progress.questionStats();
    }

    public List<Attempt> attempts() {
        return progress.attempts();
    }

    public Streak streak() {
        return progress.streak();
    }

    public void recordStreakDay() {
        progress = new Progress(progress.moduleStates(), progress.quizResults(),
                progress.questionStats(), progress.attempts(), progress.streak().recordDay());
        repository.save(progress);
    }

    public int overallPercent(int totalModules) {
        return progress.overallPercent(totalModules);
    }
}
