import { useEffect, useState } from "react";
import {
  Box, Button, Heading, HStack, Spinner, Text, VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuestionRenderer from "../components/QuestionRenderer";
import ErrorPage from "../components/ErrorPage";

function ErrorReviewPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const loadQuiz = () => {
    setLoading(true); setError(null);
    api.getErrorReviewQuiz().then((q) => { setQuiz(q); setSelected(q.questions.map(() => [])); setResult(null); })
      .catch((err: Error) => { if (err instanceof ApiError) setErrorStatus(err.status); else setError(err.message); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuiz(); }, []);

  const toggleOption = (questionIndex: number, optionIndex: number) => {
    if (!quiz) return;
    const type = quiz.questions[questionIndex].type;
    setSelected((prev) => {
      const next = prev.map((q) => [...q]);
      if (type === "SINGLE" || type === "TRUE_FALSE") next[questionIndex] = [optionIndex];
      else { const c = next[questionIndex]; next[questionIndex] = c.includes(optionIndex) ? c.filter((i) => i !== optionIndex) : [...c, optionIndex]; }
      return next;
    });
  };

  const submit = async () => {
    if (!quiz) return;
    setLoading(true);
    try { setResult(await api.submitQuizV2(quiz.id, [], selected)); }
    catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  if (loading && !quiz) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;
  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <Text color={colors.error}>{error}</Text>;

  if (result) {
    const pending = result.feedback.filter((f) => !f.correct).length;
    return (
      <Box textAlign="center">
        <Heading size="lg" mb={4}>Repaso de Errores - Resultado</Heading>
        <Heading size="xl" color={result.passed ? colors.success : colors.error} mb={2}>
          {Math.round((result.score / result.total) * 100)}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </Heading>
        <Text color={colors.textMuted} mb={2}>{result.score} / {result.total} correctas</Text>
        {pending > 0
          ? <Text color={colors.textMuted} mb={6}>Quedan {pending} pregunta{pending !== 1 ? "s" : ""} por repasar.</Text>
          : <Text color={colors.success} mb={6}>Has dominado todas las preguntas que fallaste.</Text>}
        <VStack align="stretch" spacing={3} mb={6} maxW="600px" mx="auto">
          {result.feedback.map((fb, i) => (
            <Box key={fb.questionId} bg={colors.surface} border="1px solid" borderColor={fb.correct ? colors.success : colors.error} borderRadius="10px" p={4} textAlign="left">
              <Text fontWeight="600" mb={1}>{i + 1}. {fb.correct ? "Correcta" : "Incorrecta"}</Text>
              <Text fontSize="sm" color={colors.textMuted}>{fb.explanation}</Text>
            </Box>
          ))}
        </VStack>
        <HStack justify="center" spacing={3}>
          {pending > 0 && <Button colorScheme="blue" onClick={loadQuiz}>Repasar de nuevo</Button>}
          <Button variant="outline" onClick={onExit}>Volver</Button>
        </HStack>
      </Box>
    );
  }

  if (quiz && quiz.questions.length === 0) {
    return (
      <Box>
        <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
        <Heading size="lg" mb={4}>Repaso de Errores</Heading>
        <Text color={colors.success}>No hay preguntas pendientes para repasar. Responde quizzes para generar el banco de errores.</Text>
      </Box>
    );
  }

  if (quiz) {
    const answeredAll = selected.every((q) => q.length > 0);
    return (
      <Box>
        <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Salir</Button>
        <Heading size="lg" mb={2}>Repaso de Errores</Heading>
        <Text color={colors.textMuted} mb={6}>{quiz.questions.length} pregunta{quiz.questions.length !== 1 ? "s" : ""} por repasar. Acertar 2 veces seguidas la elimina del banco.</Text>
        <VStack align="stretch" spacing={4}>
          {quiz.questions.map((question, qIndex) => (
            <QuestionRenderer
              key={question.id}
              questionIndex={qIndex}
              question={question}
              selectedIndices={selected[qIndex] ?? []}
              onToggle={(oIndex) => toggleOption(qIndex, oIndex)}
            />
          ))}
        </VStack>
        <Button colorScheme="blue" mt={6} isDisabled={!answeredAll || loading} onClick={submit}>
          {loading ? "Enviando..." : "Enviar respuestas"}
        </Button>
      </Box>
    );
  }

  return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;
}

export default ErrorReviewPage;
