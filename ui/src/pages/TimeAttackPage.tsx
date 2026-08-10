import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Heading, HStack, Select, Text, VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import TimerBar from "../components/TimerBar";
import { QuestionBody } from "../components/QuestionRenderer";
import ErrorPage from "../components/ErrorPage";

function TimeAttackPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => {
      if (err instanceof ApiError) setErrorStatus(err.status);
      else setError(err.message);
    });
  }, []);

  const startQuiz = async () => {
    if (!selectedModule) return;
    setLoading(true); setError(null);
    try {
      const q = await api.getQuiz(selectedModule);
      setQuiz(q);
      setAnswers(q.questions.map((question) => question.type === "ORDER" ? question.options.map((_, i) => i) : []));
      setSelected([]); setCurrent(0); setTotalElapsed(0); setQuizStarted(true);
    } catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const submitAnswers = async (finalAnswers: number[][]) => {
    if (!quiz) return;
    setQuizStarted(false); setLoading(true);
    try { setResult(await api.submitQuizV2(quiz.id, [selectedModule], finalAnswers, totalElapsed)); }
    catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const timeUp = useCallback(() => {
    if (!quiz) return;
    const newAnswers = [...answers]; newAnswers[current] = selected.length > 0 ? selected : [];
    setAnswers(newAnswers); setSelected([]);
    if (current + 1 < quiz.questions.length) setCurrent(current + 1);
    else submitAnswers(newAnswers);
  }, [quiz, current, selected, answers]);

  const toggleOption = (optionIndex: number) => {
    if (!quiz) return;
    const type = quiz.questions[current].type;
    if (type === "SINGLE" || type === "TRUE_FALSE") setSelected([optionIndex]);
    else setSelected((prev) => prev.includes(optionIndex) ? prev.filter((i) => i !== optionIndex) : [...prev, optionIndex]);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    const newAnswers = [...answers]; newAnswers[current] = selected;
    setAnswers(newAnswers); setSelected([]);
    if (current + 1 < quiz.questions.length) setCurrent(current + 1);
    else submitAnswers(newAnswers);
  };

  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <Text color={colors.error}>{error}</Text>;

  if (result) {
    const minutes = Math.floor(totalElapsed / 60); const seconds = totalElapsed % 60;
    return (
      <Box textAlign="center">
        <Heading size="lg" mb={4}>Contra Reloj - Resultado</Heading>
        <Heading size="xl" color={result.passed ? colors.success : colors.error} mb={2}>
          {Math.round((result.score / result.total) * 100)}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
        </Heading>
        <Text color={colors.textMuted} mb={6}>{result.score} / {result.total} correctas en {minutes}:{seconds.toString().padStart(2, "0")}</Text>
        <VStack align="stretch" spacing={3} mb={6} maxW="600px" mx="auto">
          {result.feedback.map((fb, i) => (
            <Box key={fb.questionId} bg={colors.surface} border="1px solid" borderColor={fb.correct ? colors.success : colors.error} borderRadius="10px" p={4} textAlign="left">
              <Text fontWeight="600" mb={1}>{i + 1}. {fb.correct ? "Correcta" : "Incorrecta"}</Text>
              <Text fontSize="sm" color={colors.textMuted}>{fb.explanation}</Text>
            </Box>
          ))}
        </VStack>
        <HStack justify="center" spacing={3}>
          <Button colorScheme="blue" onClick={() => setResult(null)}>Reintentar</Button>
          <Button variant="outline" onClick={onExit}>Volver</Button>
        </HStack>
      </Box>
    );
  }

  if (quiz && quizStarted) {
    const question = quiz.questions[current];
    return (
      <Box>
        <TimerBar totalSeconds={secondsPerQuestion} onTimeUp={timeUp} running={quizStarted} />
        <Text color={colors.textMuted} mb={4}>Pregunta {current + 1} de {quiz.questions.length}</Text>
        <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
          <Text fontWeight="600" mb={3}>{question.text}</Text>
          <QuestionBody
            question={question}
            selectedIndices={selected}
            onToggle={toggleOption}
            onOrderChange={(order) => setSelected(order)}
          />
        </Box>
        <Button colorScheme="blue" isDisabled={selected.length === 0} onClick={nextQuestion}>
          {current + 1 < quiz.questions.length ? "Siguiente" : "Finalizar"}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
      <Heading size="lg" mb={2}>Quiz Contra Reloj</Heading>
      <Text color={colors.textMuted} mb={6}>Responde antes de que se agote el tiempo por pregunta. Si el tiempo se agota, la pregunta se cuenta como incorrecta.</Text>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} maxW="400px">
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text color={colors.textMuted} mb={2}>Modulo:</Text>
            <Select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} bg={colors.surfaceHover} borderColor={colors.border}>
              <option value="">Seleccionar modulo</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </Select>
          </Box>
          <Box>
            <Text color={colors.textMuted} mb={2}>Segundos por pregunta:</Text>
            <Select value={secondsPerQuestion} onChange={(e) => setSecondsPerQuestion(Number(e.target.value))} bg={colors.surfaceHover} borderColor={colors.border}>
              <option value={15}>15s</option><option value={30}>30s</option><option value={45}>45s</option><option value={60}>60s</option>
            </Select>
          </Box>
          <Button colorScheme="blue" isDisabled={!selectedModule || loading} onClick={startQuiz}>
            {loading ? "Cargando..." : "Iniciar"}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default TimeAttackPage;
