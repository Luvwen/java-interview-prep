package com.javatheory.application;

import com.javatheory.domain.Attempt;
import com.javatheory.domain.Module;
import com.javatheory.domain.PassRule;
import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionStats;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Quiz;
import com.javatheory.domain.QuizMode;
import com.javatheory.domain.QuizResult;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class QuizService {

    private final ModuleService moduleService;

    public QuizService(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    public Optional<Quiz> quizForModule(String moduleId) {
        return moduleService.findQuiz(moduleId);
    }

    public QuizResult evaluate(Quiz quiz, List<Set<Integer>> answers) {
        List<Question> questions = quiz.questions();
        int total = questions.size();
        int correct = 0;
        for (int i = 0; i < total; i++) {
            Set<Integer> selected = i < answers.size() ? answers.get(i) : Set.of();
            if (questions.get(i).isCorrect(selected)) {
                correct++;
            }
        }
        boolean passed = PassRule.passed(correct, total);
        return QuizResult.of(quiz.id(), correct, total, passed);
    }

    public QuizResult evaluateOrdered(Quiz quiz, List<List<Integer>> answers) {
        List<Question> questions = quiz.questions();
        int total = questions.size();
        int correct = 0;
        for (int i = 0; i < total; i++) {
            Question q = questions.get(i);
            List<Integer> answer = i < answers.size() ? answers.get(i) : List.of();
            if (q.type() == QuestionType.ORDER) {
                if (answer.equals(q.correctIndexes())) {
                    correct++;
                }
            } else if (q.type() == QuestionType.CODE_FILL) {
                // CODE_FILL is evaluated separately via evaluateWithTextAnswers
                // When called from evaluateOrdered, count as incorrect
            } else if (q.type() == QuestionType.BUG_HUNT) {
                Set<Integer> selected = new HashSet<>(answer);
                if (q.isCorrectBugHunt(selected)) {
                    correct++;
                }
            } else {
                Set<Integer> selected = new HashSet<>(answer);
                if (q.isCorrect(selected)) {
                    correct++;
                }
            }
        }
        boolean passed = PassRule.passed(correct, total);
        return QuizResult.of(quiz.id(), correct, total, passed);
    }

    public QuizResult evaluateWithTextAnswers(Quiz quiz, List<List<Integer>> answers,
                                               Map<String, List<String>> textAnswers) {
        List<Question> questions = quiz.questions();
        int total = questions.size();
        int correct = 0;
        for (int i = 0; i < total; i++) {
            Question q = questions.get(i);
            List<Integer> answer = i < answers.size() ? answers.get(i) : List.of();
            if (q.type() == QuestionType.ORDER) {
                if (answer.equals(q.correctIndexes())) {
                    correct++;
                }
            } else if (q.type() == QuestionType.CODE_FILL) {
                List<String> textAnswer = textAnswers != null
                        ? textAnswers.getOrDefault(q.id(), List.of())
                        : List.of();
                if (q.isCorrectCodeFill(textAnswer)) {
                    correct++;
                }
            } else if (q.type() == QuestionType.BUG_HUNT) {
                Set<Integer> selected = new HashSet<>(answer);
                if (q.isCorrectBugHunt(selected)) {
                    correct++;
                }
            } else {
                Set<Integer> selected = new HashSet<>(answer);
                if (q.isCorrect(selected)) {
                    correct++;
                }
            }
        }
        boolean passed = PassRule.passed(correct, total);
        return QuizResult.of(quiz.id(), correct, total, passed);
    }

    public QuizResult evaluateAndRecord(Quiz quiz, List<Set<Integer>> answers,
                                         QuizMode mode, List<String> moduleIds,
                                         ProgressService progressService, int durationSeconds) {
        List<Question> questions = quiz.questions();
        int total = questions.size();
        int correct = 0;
        for (int i = 0; i < total; i++) {
            Set<Integer> selected = i < answers.size() ? answers.get(i) : Set.of();
            boolean isCorrect = questions.get(i).isCorrect(selected);
            if (isCorrect) {
                correct++;
            }
            progressService.recordQuestionStats(questions.get(i).id(), isCorrect);
        }
        boolean passed = PassRule.passed(correct, total);

        if (mode == QuizMode.NORMAL && moduleIds.size() == 1) {
            QuizResult result = QuizResult.of(quiz.id(), correct, total, passed);
            progressService.recordResult(result);
        }

        Attempt attempt = Attempt.of(quiz.id(), mode, moduleIds, correct, total, passed, durationSeconds);
        progressService.recordAttempt(attempt);

        return new QuizResult(quiz.id(), correct, total, passed, null);
    }

    public Optional<Quiz> mixedQuiz(List<String> moduleIds, int count) {
        List<Question> allQuestions = moduleIds.stream()
                .map(moduleService::findQuiz)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .flatMap(quiz -> quiz.questions().stream())
                .collect(Collectors.toList());

        if (allQuestions.isEmpty() || count <= 0) {
            return Optional.empty();
        }

        int n = Math.min(count, allQuestions.size());
        Collections.shuffle(allQuestions);
        List<Question> selected = allQuestions.subList(0, n);
        return Optional.of(new Quiz("mixed-" + System.currentTimeMillis(), new ArrayList<>(selected)));
    }

    public Optional<Quiz> errorReviewQuiz(Map<String, QuestionStats> stats) {
        List<Question> allQuestions = moduleService.listModules().stream()
                .map(Module::quiz)
                .flatMap(quiz -> quiz.questions().stream())
                .filter(question -> {
                    QuestionStats qs = stats.getOrDefault(question.id(), new QuestionStats());
                    return qs.wrong() > 0 && qs.needsReview();
                })
                .collect(Collectors.toList());

        if (allQuestions.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(new Quiz("error-review-" + System.currentTimeMillis(), allQuestions));
    }
}
