package com.javatheory.application;

import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionStats;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Quiz;
import com.javatheory.domain.QuizMode;
import com.javatheory.domain.QuizResult;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuizServiceTest {

    private QuizService serviceWithRealModules() {
        return new QuizService(new ModuleService(
                new com.javatheory.infrastructure.ModuleLoader(
                        new com.fasterxml.jackson.databind.ObjectMapper(), "modules")));
    }

    private Quiz quiz(int size) {
        java.util.ArrayList<Question> questions = new java.util.ArrayList<>();
        for (int i = 0; i < size; i++) {
            questions.add(new Question("q" + i, "text", List.of("A", "B", "C"),
                    List.of(0), "expl", QuestionType.SINGLE));
        }
        return new Quiz("m1", questions);
    }

    private QuizService serviceWithNullModuleService() {
        return new QuizService(null);
    }

    @Test
    void evaluatesAllCorrectAnswers() {
        Quiz quiz = quiz(3);
        QuizResult result = serviceWithNullModuleService().evaluate(quiz, List.of(Set.of(0), Set.of(0), Set.of(0)));
        assertEquals(3, result.score());
        assertEquals(3, result.total());
        assertTrue(result.passed());
    }

    @Test
    void evaluatesSeventyPercentAsPassing() {
        QuizResult result = serviceWithNullModuleService().evaluate(quiz(10), List.of(
                Set.of(0), Set.of(0), Set.of(0), Set.of(0), Set.of(0), Set.of(0), Set.of(0),
                Set.of(1), Set.of(1), Set.of(1)));
        assertEquals(7, result.score());
        assertTrue(result.passed());
    }

    @Test
    void evaluatesBelowThresholdAsFailed() {
        QuizResult result = serviceWithNullModuleService().evaluate(quiz(10), List.of(
                Set.of(0), Set.of(0), Set.of(0), Set.of(0), Set.of(0), Set.of(0),
                Set.of(1), Set.of(1), Set.of(1), Set.of(1)));
        assertEquals(6, result.score());
        assertFalse(result.passed());
    }

    @Test
    void missingAnswersCountAsIncorrect() {
        QuizResult result = serviceWithNullModuleService().evaluate(quiz(3), List.of(Set.of(0)));
        assertEquals(1, result.score());
        assertFalse(result.passed());
    }

    @Test
    void errorReviewSelectsOnlyWrongQuestionsWithLowStreak() {
        QuizService realService = serviceWithRealModules();

        String q1 = realService.quizForModule("core-java").get().questions().get(0).id();
        String q2 = realService.quizForModule("core-java").get().questions().get(1).id();

        Map<String, QuestionStats> stats = Map.of(
                q1, new QuestionStats(0, 2, 0),
                q2, new QuestionStats(3, 0, 3)
        );

        var quizOpt = realService.errorReviewQuiz(stats);
        assertTrue(quizOpt.isPresent());
        List<String> ids = quizOpt.get().questions().stream().map(Question::id).toList();
        assertTrue(ids.contains(q1));
        assertFalse(ids.contains(q2));
    }

    @Test
    void errorReviewReturnsEmptyWhenNoErrors() {
        QuizService realService = serviceWithRealModules();

        String q1 = realService.quizForModule("core-java").get().questions().get(0).id();
        Map<String, QuestionStats> stats = Map.of(q1, new QuestionStats(3, 0, 3));

        assertTrue(realService.errorReviewQuiz(stats).isEmpty());
    }

    @Test
    void errorReviewReturnsEmptyOnEmptyStats() {
        QuizService realService = serviceWithRealModules();
        assertTrue(realService.errorReviewQuiz(Map.of()).isEmpty());
    }
}
