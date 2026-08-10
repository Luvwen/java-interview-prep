package com.javatheory.domain;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuestionTest {

    private Question single() {
        return new Question("q1", "text", List.of("A", "B", "C"), List.of(1), "expl", QuestionType.SINGLE);
    }

    private Question multiple() {
        return new Question("q2", "text", List.of("X", "Y", "Z"), List.of(0, 2), "expl", QuestionType.MULTIPLE);
    }

    private Question trueFalse() {
        return new Question("q3", "text", List.of("Verdadero", "Falso"), List.of(0), "expl", QuestionType.TRUE_FALSE);
    }

    @Test
    void trueFalseAnswerIsCorrectOnlyWithExactMatch() {
        assertTrue(trueFalse().isCorrect(Set.of(0)));
        assertFalse(trueFalse().isCorrect(Set.of(1)));
        assertFalse(trueFalse().isCorrect(Set.of()));
        assertFalse(trueFalse().isCorrect(Set.of(0, 1)));
    }

    @Test
    void singleAnswerIsCorrectOnlyWithExactMatch() {
        assertTrue(single().isCorrect(Set.of(1)));
        assertFalse(single().isCorrect(Set.of(0)));
        assertFalse(single().isCorrect(Set.of(1, 2)));
    }

    @Test
    void multipleAnswerRequiresFullMatch() {
        assertTrue(multiple().isCorrect(Set.of(0, 2)));
        assertFalse(multiple().isCorrect(Set.of(0)));
        assertFalse(multiple().isCorrect(Set.of(0, 1, 2)));
    }

    @Test
    void nullSelectionIsIncorrect() {
        assertFalse(single().isCorrect(null));
    }

    @Test
    void orderAnswerRequiresExactSequence() {
        Question order = new Question("q4", "order", List.of("A", "B", "C"), List.of(2, 0, 1), "expl", QuestionType.ORDER);
        // ORDER is evaluated via List comparison in QuizService.evaluateOrdered, not via isCorrect(Set)
        // isCorrect with a Set always returns false for ORDER since Sets don't preserve order
        assertFalse(order.isCorrect(Set.of(2, 0, 1)));
        assertFalse(order.isCorrect(Set.of(0, 1, 2)));
    }
}
