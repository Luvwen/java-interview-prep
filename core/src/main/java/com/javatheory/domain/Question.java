package com.javatheory.domain;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public record Question(String id, String text, List<String> options,
                       List<Integer> correctIndexes, String explanation, QuestionType type,
                       String codeTemplate, List<String> blanks, String code) {

    public Question(String id, String text, List<String> options,
                    List<Integer> correctIndexes, String explanation, QuestionType type) {
        this(id, text, options, correctIndexes, explanation, type, null, null, null);
    }

    public boolean isCorrect(Set<Integer> selected) {
        if (selected == null) {
            return false;
        }
        if (type == QuestionType.ORDER || type == QuestionType.CODE_FILL || type == QuestionType.BUG_HUNT) {
            return false;
        }
        Set<Integer> expected = new HashSet<>(correctIndexes);
        return expected.equals(selected);
    }

    public boolean isCorrectCodeFill(List<String> userAnswers) {
        if (type != QuestionType.CODE_FILL || blanks == null) {
            return false;
        }
        if (userAnswers == null || userAnswers.size() != blanks.size()) {
            return false;
        }
        for (int i = 0; i < blanks.size(); i++) {
            String expected = blanks.get(i).trim().toLowerCase();
            String actual = userAnswers.get(i).trim().toLowerCase();
            if (!expected.equals(actual)) {
                return false;
            }
        }
        return true;
    }

    public boolean isCorrectBugHunt(Set<Integer> selected) {
        if (type != QuestionType.BUG_HUNT) {
            return false;
        }
        if (selected == null) {
            return false;
        }
        Set<Integer> expected = new HashSet<>(correctIndexes);
        return expected.equals(selected);
    }
}
