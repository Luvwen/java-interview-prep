package com.javatheory.web.controller;

import com.javatheory.application.ModuleService;
import com.javatheory.application.ProgressService;
import com.javatheory.application.QuizService;
import com.javatheory.domain.Question;
import com.javatheory.domain.QuestionType;
import com.javatheory.domain.Quiz;
import com.javatheory.domain.QuizMode;
import com.javatheory.domain.QuizResult;
import com.javatheory.web.dto.MixedQuizRequest;
import com.javatheory.web.dto.QuestionFeedback;
import com.javatheory.web.dto.QuizQuestionDto;
import com.javatheory.web.dto.QuizResponse;
import com.javatheory.web.dto.QuizResultResponse;
import com.javatheory.web.dto.QuizSubmitRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz")
public class QuizActivityController {

    private final QuizService quizService;
    private final ProgressService progressService;

    public QuizActivityController(QuizService quizService, ProgressService progressService,
                                   ModuleService moduleService) {
        this.quizService = quizService;
        this.progressService = progressService;
    }

    @PostMapping("/mixed")
    public ResponseEntity<QuizResponse> mixedQuiz(@RequestBody MixedQuizRequest request) {
        return quizService.mixedQuiz(request.moduleIds(), request.count())
                .map(quiz -> ResponseEntity.ok(toResponse(quiz)))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @PostMapping("/errors")
    public ResponseEntity<QuizResponse> errorReviewQuiz() {
        return quizService.errorReviewQuiz(progressService.questionStats())
                .map(quiz -> ResponseEntity.ok(toResponse(quiz)))
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultResponse> submit(@RequestBody QuizSubmitRequest request) {
        QuizMode mode = determineMode(request);
        List<String> moduleIds = request.moduleIds() != null ? request.moduleIds() : List.of();

        Quiz quiz = resolveQuiz(request, mode);
        if (quiz == null) {
            return ResponseEntity.badRequest().build();
        }

        if (request.questionIds() != null && !request.questionIds().isEmpty()) {
            List<Question> filtered = quiz.questions().stream()
                    .filter(q -> request.questionIds().contains(q.id()))
                    .collect(Collectors.toList());
            quiz = new Quiz(quiz.id(), filtered);
        }

        List<List<Integer>> raw = request.answers() != null ? request.answers() : List.of();
        Map<String, List<String>> textAnswers = request.textAnswers();

        QuizResult result = quizService.evaluateWithTextAnswers(quiz, raw, textAnswers);
        progressService.recordResult(result);
        progressService.recordAttempt(
                com.javatheory.domain.Attempt.of(quiz.id(), mode, moduleIds,
                        result.score(), result.total(), result.passed(),
                        request.durationSeconds() != null ? request.durationSeconds() : 0));

        List<QuestionFeedback> feedback = new ArrayList<>();
        List<Question> questions = quiz.questions();
        for (int i = 0; i < questions.size(); i++) {
            List<Integer> answer = i < raw.size() ? raw.get(i) : List.of();
            Question question = questions.get(i);
            boolean correct;
            if (question.type() == QuestionType.CODE_FILL) {
                List<String> textAnswer = textAnswers != null
                        ? textAnswers.getOrDefault(question.id(), List.of())
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
        return ResponseEntity.ok(new QuizResultResponse(result.score(), result.total(), result.passed(), feedback));
    }

    private QuizMode determineMode(QuizSubmitRequest request) {
        if (request.quizId() == null) return QuizMode.NORMAL;
        if (request.quizId().startsWith("mixed-")) return QuizMode.MIXED;
        if (request.quizId().startsWith("error-review-")) return QuizMode.ERROR_REVIEW;
        return QuizMode.NORMAL;
    }

    private Quiz resolveQuiz(QuizSubmitRequest request, QuizMode mode) {
        if (mode == QuizMode.NORMAL && request.moduleIds() != null && request.moduleIds().size() == 1) {
            return quizService.quizForModule(request.moduleIds().get(0)).orElse(null);
        }
        if (mode == QuizMode.MIXED) {
            return quizService.mixedQuiz(request.moduleIds(), request.answers().size()).orElse(null);
        }
        if (mode == QuizMode.ERROR_REVIEW) {
            return quizService.errorReviewQuiz(progressService.questionStats()).orElse(null);
        }
        return null;
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizQuestionDto> questions = quiz.questions().stream()
                .map(QuizQuestionDto::fromQuestion)
                .toList();
        return new QuizResponse(quiz.id(), questions);
    }
}
