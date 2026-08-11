package com.javatheory.web.controller;

import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Quiz;
import com.javatheory.domain.QuizResult;
import com.javatheory.web.dto.QuestionFeedback;
import com.javatheory.web.dto.QuizQuestionDto;
import com.javatheory.web.dto.QuizResponse;
import com.javatheory.web.dto.QuizResultResponse;
import com.javatheory.web.dto.QuizSubmitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/modules/{moduleId}/quiz")
public class QuizController {

    private final QuizService quizService;
    private final ProgressService progressService;

    public QuizController(QuizService quizService, ProgressService progressService) {
        this.quizService = quizService;
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable("moduleId") String moduleId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) List<String> moduleIds) {

        if (isActivityModule(moduleId)) {
            return quizService.activityQuiz(moduleId, difficulty, moduleIds)
                    .map(quiz -> ResponseEntity.ok(toResponse(quiz)))
                    .orElseGet(() -> ResponseEntity.badRequest().build());
        }

        return quizService.quizForModule(moduleId)
                .map(quiz -> ResponseEntity.ok(toResponse(quiz)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<QuizResultResponse> submit(@PathVariable("moduleId") String moduleId,
                                                     @RequestBody QuizSubmitRequest request) {
        return quizService.quizForModule(moduleId)
                .map(quiz -> ResponseEntity.ok(evaluate(quiz, request)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean isActivityModule(String moduleId) {
        return "code-fill".equals(moduleId) || "bug-hunt".equals(moduleId);
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizQuestionDto> questions = quiz.questions().stream()
                .map(question -> new QuizQuestionDto(question.id(), question.text(),
                        question.options(), question.type(),
                        question.codeTemplate(), question.blanks(), question.code(),
                        question.difficulty(), question.moduleId()))
                .toList();
        return new QuizResponse(quiz.id(), questions);
    }

    private QuizResultResponse evaluate(Quiz quiz, QuizSubmitRequest request) {
        List<List<Integer>> raw = request.answers() != null ? request.answers() : List.of();

        QuizResult result = quizService.evaluateWithTextAnswers(quiz, raw, request.textAnswers());
        progressService.recordResult(result);

        List<QuestionFeedback> feedback = new ArrayList<>();
        List<Question> questions = quiz.questions();
        for (int i = 0; i < questions.size(); i++) {
            List<Integer> answer = i < raw.size() ? raw.get(i) : List.of();
            Question question = questions.get(i);
            boolean correct;
            if (question.type() == QuestionType.CODE_FILL) {
                List<String> textAnswer = request.textAnswers() != null
                        ? request.textAnswers().getOrDefault(question.id(), List.of())
                        : List.of();
                correct = question.isCorrectCodeFill(textAnswer);
            } else if (question.type() == QuestionType.ORDER) {
                correct = answer.equals(question.correctIndexes());
            } else if (question.type() == QuestionType.BUG_HUNT) {
                correct = question.isCorrectBugHunt(new HashSet<>(answer));
            } else {
                correct = question.isCorrect(new HashSet<>(answer));
            }
            feedback.add(new QuestionFeedback(question.id(), correct, question.explanation()));
        }
        return new QuizResultResponse(result.score(), result.total(), result.passed(), feedback);
    }
}
