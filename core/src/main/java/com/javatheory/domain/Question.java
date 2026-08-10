package com.javatheory.domain;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public record Question(String id, String text, List<String> options,
                       List<Integer> correctIndexes, String explanation, QuestionType type) {

    public boolean isCorrect(Set<Integer> selected) {
        if (selected == null) {
            return false;
        }
        if (type == QuestionType.ORDER) {
            return false;
        }
        Set<Integer> expected = new HashSet<>(correctIndexes);
        return expected.equals(selected);
    }
}
