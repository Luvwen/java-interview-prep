import { useEffect, useState } from "react";
import {
  Box, Button, Checkbox, Flex, Heading, Select, Stack, Text, VStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, Quiz, QuizResult } from "../types";
import QuestionRenderer from "../components/QuestionRenderer";
import QuizFeedback from "../components/QuizFeedback";
import ErrorPage from "../components/ErrorPage";

function MixedQuizPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selected, setSelected] = useState<number[][]>([]);
  const [codeFillAnswers, setCodeFillAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => {
      if (err instanceof ApiError) setErrorStatus(err.status);
      else setError(err.message);
    });
  }, []);

  const toggleModule = (id: string) => setSelectedModules((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  const selectAll = () => setSelectedModules(modules.map((m) => m.id));

  const startQuiz = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true); setError(null);
    try {
      const q = await api.getMixedQuiz(selectedModules, count);
      setQuiz(q);
      setSelected(q.questions.map((question) => question.type === "ORDER" ? question.options.map((_, i) => i) : []));
      setCodeFillAnswers({});
    } catch (err) {
      if (err instanceof ApiError) setErrorStatus(err.status);
      else setError((err as Error).message);
    } finally { setLoading(false); }
  };

  const toggleOption = (questionIndex: number, optionIndex: number) => {
    if (!quiz) return;
    const type = quiz.questions[questionIndex].type;
    setSelected((prev) => {
      const next = prev.map((q) => [...q]);
      if (type === "SINGLE" || type === "TRUE_FALSE" || type === "BUG_HUNT") next[questionIndex] = [optionIndex];
      else { const c = next[questionIndex]; next[questionIndex] = c.includes(optionIndex) ? c.filter((i) => i !== optionIndex) : [...c, optionIndex]; }
      return next;
    });
  };

  const handleCodeFillChange = (questionId: string, answers: string[]) => {
    setCodeFillAnswers((prev) => ({ ...prev, [questionId]: answers }));
  };

  const submit = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const textAnswers: Record<string, string[]> = {};
      for (const q of quiz.questions) {
        if (q.type === "CODE_FILL" && codeFillAnswers[q.id]) {
          textAnswers[q.id] = codeFillAnswers[q.id];
        }
      }
      setResult(await api.submitQuizV2(quiz.id, selectedModules, selected, undefined, textAnswers));
    }
    catch (err) { if (err instanceof ApiError) setErrorStatus(err.status); else setError((err as Error).message); }
    finally { setLoading(false); }
  };

  if (errorStatus) return <ErrorPage status={errorStatus} onBack={onExit} />;
  if (error) return <Text color={colors.error}>{error}</Text>;

  if (result) {
    return (
      <QuizFeedback
        title="Quiz Mixto - Resultado"
        result={result}
        onRetry={() => setResult(null)}
        onExit={onExit}
      />
    );
  }

  if (quiz) {
    const answeredAll = quiz.questions.every((q, i) => {
      if (q.type === "ORDER") return true;
      if (q.type === "CODE_FILL") {
        const ans = codeFillAnswers[q.id];
        return ans && ans.length === (q.blanks?.length ?? 0) && ans.every((a) => a.trim() !== "");
      }
      return selected[i].length > 0;
    });
    return (
      <Box>
        <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Salir</Button>
        <Heading size="lg" mb={2}>Quiz Mixto</Heading>
        <Text color={colors.textMuted} mb={6}>{quiz.questions.length} preguntas de {selectedModules.length} modulos</Text>
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
        <Button colorScheme="blue" mt={6} isDisabled={!answeredAll || loading} onClick={submit}>
          {loading ? "Enviando..." : "Enviar respuestas"}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
      <Heading size="lg" mb={2}>Quiz Mixto Aleatorio</Heading>
      <Text color={colors.textMuted} mb={6}>Selecciona los modulos y la cantidad de preguntas. Las preguntas se eligen aleatoriamente del banco, mezclando formatos.</Text>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
        <Flex align="center" justify="space-between" mb={3}>
          <Heading size="sm">Modulos</Heading>
          <Button variant="link" size="sm" color={colors.accent} onClick={selectAll}>Seleccionar todos</Button>
        </Flex>
        <Stack spacing={2}>
          {modules.map((m) => (
            <Checkbox key={m.id} isChecked={selectedModules.includes(m.id)} onChange={() => toggleModule(m.id)} colorScheme="blue">
              {m.title}
            </Checkbox>
          ))}
        </Stack>
      </Box>
      <Box mb={4}>
        <Text color={colors.textMuted} mb={2}>Cantidad de preguntas:</Text>
        <Select value={count} onChange={(e) => setCount(Number(e.target.value))} maxW="200px" bg={colors.surfaceHover} borderColor={colors.border}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </Select>
      </Box>
      <Button colorScheme="blue" isDisabled={selectedModules.length === 0 || loading} onClick={startQuiz}>
        {loading ? "Generando..." : "Iniciar quiz"}
      </Button>
    </Box>
  );
}

export default MixedQuizPage;
