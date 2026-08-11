import { useEffect, useState } from "react";
import {
  Box, Button, Heading, Text, VStack, Spinner,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuestionRenderer from "../components/QuestionRenderer";
import QuizFeedback from "../components/QuizFeedback";

function QuizPage({ moduleId, onExit }: { moduleId: string; onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [codeFillAnswers, setCodeFillAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getQuiz(moduleId).then((q) => {
      setQuiz(q);
      setSelected(q.questions.map((question) => question.type === "ORDER" ? question.options.map((_, i) => i) : []));
      setCodeFillAnswers({});
      setResult(null);
    }).catch((err: Error) => setError(err.message));
  }, [moduleId]);

  if (error) return <Text color={colors.error}>{error}</Text>;
  if (!quiz) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;

  const toggleOption = (questionIndex: number, optionIndex: number) => {
    const type = quiz.questions[questionIndex].type;
    setSelected((prev) => {
      const next = prev.map((q) => [...q]);
      if (type === "SINGLE" || type === "TRUE_FALSE" || type === "BUG_HUNT") {
        next[questionIndex] = [optionIndex];
      } else {
        const current = next[questionIndex];
        next[questionIndex] = current.includes(optionIndex) ? current.filter((i) => i !== optionIndex) : [...current, optionIndex];
      }
      return next;
    });
  };

  const handleCodeFillChange = (questionId: string, answers: string[]) => {
    setCodeFillAnswers((prev) => ({ ...prev, [questionId]: answers }));
  };

  const isAnswered = (qIndex: number) => {
    const question = quiz.questions[qIndex];
    if (question.type === "ORDER") return true;
    if (question.type === "CODE_FILL") {
      const ans = codeFillAnswers[question.id];
      return ans && ans.length === (question.blanks?.length ?? 0) && ans.every((a) => a.trim() !== "");
    }
    return selected[qIndex].length > 0;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const textAnswers: Record<string, string[]> = {};
      for (const q of quiz.questions) {
        if (q.type === "CODE_FILL" && codeFillAnswers[q.id]) {
          textAnswers[q.id] = codeFillAnswers[q.id];
        }
      }
      setResult(await api.submitQuiz(moduleId, selected, textAnswers));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredAll = quiz.questions.every((_, i) => isAnswered(i));

  if (result) {
    return (
      <QuizFeedback
        title="Resultado"
        result={result}
        onRetry={() => setResult(null)}
        onExit={onExit}
        retryLabel="Reintentar"
      />
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">
        Salir
      </Button>
      <Heading size="lg" mb={6}>Quiz</Heading>
      <VStack align="stretch" spacing={4}>
        {quiz.questions.map((question, qIndex) => (
          <QuestionRenderer
            key={question.id}
            questionIndex={qIndex}
            question={question}
            selectedIndices={selected[qIndex] ?? []}
            onToggle={(oIndex) => toggleOption(qIndex, oIndex)}
            onOrderChange={(order) => {
              setSelected((prev) => { const next = [...prev]; next[qIndex] = order; return next; });
            }}
            onCodeFillChange={handleCodeFillChange}
            codeFillAnswers={codeFillAnswers[question.id]}
          />
        ))}
      </VStack>
      <Button colorScheme="blue" mt={6} isDisabled={!answeredAll || submitting} onClick={submit}>
        {submitting ? "Enviando..." : "Enviar respuestas"}
      </Button>
    </Box>
  );
}

export default QuizPage;
