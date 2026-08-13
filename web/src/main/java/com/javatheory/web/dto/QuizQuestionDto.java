package com.javatheory.web.dto;

import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record QuizQuestionDto(String id, String text, List<String> options, QuestionType type,
                               String codeTemplate, List<String> blanks, String code,
                               String difficulty, String moduleId, List<Integer> correctIndexes) {

    public QuizQuestionDto(String id, String text, List<String> options, QuestionType type) {
        this(id, text, options, type, null, null, null, null, null, null);
    }

    public static QuizQuestionDto fromQuestion(Question question) {
        if (question.type() == QuestionType.BUG_HUNT
                && question.options() != null && question.correctIndexes() != null) {
            List<Integer> permutation = new ArrayList<>();
            for (int i = 0; i < question.options().size(); i++) {
                permutation.add(i);
            }
            Collections.shuffle(permutation);

            List<String> shuffledOptions = new ArrayList<>();
            for (int i = 0; i < question.options().size(); i++) {
                shuffledOptions.add(question.options().get(permutation.get(i)));
            }

            List<Integer> newCorrectIndexes = new ArrayList<>();
            for (int correctIdx : question.correctIndexes()) {
                newCorrectIndexes.add(permutation.indexOf(correctIdx));
            }

            return new QuizQuestionDto(question.id(), question.text(),
                    shuffledOptions, question.type(),
                    question.codeTemplate(), question.blanks(), question.code(),
                    question.difficulty(), question.moduleId(), newCorrectIndexes);
        }
        return new QuizQuestionDto(question.id(), question.text(),
                question.options(), question.type(),
                question.codeTemplate(), question.blanks(), question.code(),
                question.difficulty(), question.moduleId(), question.correctIndexes());
    }
}
