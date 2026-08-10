import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Checkbox, Flex, Heading, HStack, Select, Stack, Text, VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import TimerBar from "../components/TimerBar";
import { QuestionBody } from "../components/QuestionRenderer";
import QuizFeedback from "../components/QuizFeedback";
import ErrorPage from "../components/ErrorPage";

function ExamPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(25);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => { api.listModules().then(setModules).catch((err: Error) => { if (err instanceof ApiError) setErrorStatus(err.status); else setError(err.message); }); }, []);

  const submitExam = async () => {
    if (!quiz) return;
    setExamStarted(false); setLoading(true);
    try { const res = await api.submitQuizV2(quiz.id, selectedModules, answers, timeLimit * 60); setResult(res); }
    catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const startExam = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true); setError(null);
    try { const q = await api.getMixedQuiz(selectedModules, questionCount); setQuiz(q); setAnswers(q.questions.map(() => [])); setCurrent(0); setExamStarted(true); }
    catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const timeUp = useCallback(() => { submitExam(); }, [answers, quiz]);

  const toggleOption = (optionIndex: number) => {
    if (!quiz) return;
    const type = quiz.questions[current].type;
    setAnswers((prev) => { const next = [...prev]; if (type === "SINGLE" || type === "TRUE_FALSE") next[current] = [optionIndex]; else { const c = next[current]; next[current] = c.includes(optionIndex) ? c.filter((i) => i !== optionIndex) : [...c, optionIndex]; } return next; });
  };

  const nextQuestion = () => { if (quiz && current + 1 < quiz.questions.length) setCurrent(current + 1); };

  const toggleModule = (id: string) => setSelectedModules((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <Text color={colors.error}>{error}</Text>;

  if (result) {
    return (
      <QuizFeedback
        title="Examen - Resultado"
        result={result}
        onRetry={() => setResult(null)}
        onExit={onExit}
        retryLabel="Repetir examen"
      />
    );
  }

  if (quiz && examStarted) {
    const question = quiz.questions[current];
    const answeredCount = answers.filter((a) => a.length > 0).length;
    return (
      <Box>
        <TimerBar totalSeconds={timeLimit * 60} onTimeUp={timeUp} running={examStarted} />
        <Flex justify="space-between" align="center" mb={4}>
          <Text color={colors.textMuted}>Pregunta {current + 1} de {quiz.questions.length}</Text>
          <Text color={colors.textMuted}>{answeredCount} respondidas</Text>
        </Flex>
        <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
          <Text fontWeight="600" mb={3}>{question.text}</Text>
          <QuestionBody
            question={question}
            selectedIndices={answers[current] ?? []}
            onToggle={toggleOption}
            onOrderChange={(order) => { setAnswers((prev) => { const next = [...prev]; next[current] = order; return next; }); }}
          />
        </Box>
        <HStack spacing={3}>
          {current + 1 < quiz.questions.length ? (
            <Button colorScheme="blue" onClick={nextQuestion}>Siguiente</Button>
          ) : (
            <Button colorScheme="blue" onClick={submitExam}>Entregar examen</Button>
          )}
        </HStack>
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
      <Heading size="lg" mb={2}>Examen Simulado</Heading>
      <Text color={colors.textMuted} mb={6}>Simula una entrevista tecnica: sin ir hacia atras, sin feedback hasta el final, con tiempo limitado.</Text>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} maxW="400px">
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text color={colors.textMuted} mb={2}>Modulos:</Text>
            <Stack spacing={2}>
              {modules.map((m) => (
                <Checkbox key={m.id} isChecked={selectedModules.includes(m.id)} onChange={() => toggleModule(m.id)} colorScheme="blue">{m.title}</Checkbox>
              ))}
            </Stack>
          </Box>
          <Box>
            <Text color={colors.textMuted} mb={2}>Cantidad de preguntas:</Text>
            <Select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} bg={colors.surfaceHover} borderColor={colors.border}>
              <option value={10}>10</option><option value={15}>15</option><option value={20}>20</option><option value={30}>30</option>
            </Select>
          </Box>
          <Box>
            <Text color={colors.textMuted} mb={2}>Tiempo limite (minutos):</Text>
            <Select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} bg={colors.surfaceHover} borderColor={colors.border}>
              <option value={10}>10 min</option><option value={15}>15 min</option><option value={25}>25 min</option><option value={40}>40 min</option>
            </Select>
          </Box>
          <Button colorScheme="blue" isDisabled={selectedModules.length === 0 || loading} onClick={startExam}>
            {loading ? "Generando..." : "Iniciar examen"}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default ExamPage;
