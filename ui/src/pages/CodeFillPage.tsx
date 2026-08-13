import { useState } from "react";
import {
  Box, Button, Heading, Text, VStack, Spinner, HStack, Wrap, WrapItem, Tag,
} from "@chakra-ui/react";
import { ArrowLeft, Play, CheckCircle, XCircle } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuizFeedback from "../components/QuizFeedback";
import CodeEditor from "../components/CodeEditor";

const MODULE_ID = "code-fill";

const DIFFICULTIES = [
  { value: "easy", label: "Facil", color: "green" },
  { value: "medium", label: "Medio", color: "yellow" },
  { value: "hard", label: "Dificil", color: "red" },
] as const;

const THEORY_MODULES = [
  { id: "core-java", label: "Core Java" },
  { id: "poo", label: "POO" },
  { id: "collections", label: "Colecciones" },
  { id: "streams", label: "Streams" },
  { id: "concurrency", label: "Concurrencia" },
  { id: "jvm", label: "JVM" },
  { id: "testing", label: "Testing" },
  { id: "sql-jdbc", label: "SQL/JDBC" },
  { id: "rest-http", label: "REST/HTTP" },
  { id: "spring", label: "Spring" },
  { id: "design-patterns", label: "Patrones" },
  { id: "git", label: "Git" },
];

function CodeFillPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [codeFillAnswers, setCodeFillAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [blankCorrectness, setBlankCorrectness] = useState<boolean[]>([]);

  const [difficulty, setDifficulty] = useState<string>("easy");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [started, setStarted] = useState(false);

  const startQuiz = () => {
    setStarted(true);
    api.getQuiz(MODULE_ID, difficulty, selectedModules.length > 0 ? selectedModules : undefined)
      .then(setQuiz)
      .catch((err: Error) => setError(err.message));
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (error) return <Text color={colors.error}>{error}</Text>;

  if (!started) {
    return (
      <Box>
        <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">
          Volver
        </Button>
        <Heading size="lg" mb={2}>Rellenar Codigo</Heading>
        <Text color={colors.textMuted} mb={6}>
          Selecciona la dificultad y los modulos que queres practicar.
        </Text>

        <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
          <Text fontWeight="600" mb={3}>Dificultad</Text>
          <HStack spacing={3} mb={5}>
            {DIFFICULTIES.map((d) => (
              <Button
                key={d.value}
                size="sm"
                variant={difficulty === d.value ? "solid" : "outline"}
                colorScheme={difficulty === d.value ? d.color : "gray"}
                onClick={() => setDifficulty(d.value)}
              >
                {d.label}
              </Button>
            ))}
          </HStack>

          <Text fontWeight="600" mb={3}>Modulos (opcional)</Text>
          <Text fontSize="sm" color={colors.textMuted} mb={3}>
            Si no seleccionas ninguno, se usan todos los modulos.
          </Text>
          <Wrap spacing={2} mb={5}>
            {THEORY_MODULES.map((m) => (
              <WrapItem key={m.id}>
                <Tag
                  size="lg"
                  variant={selectedModules.includes(m.id) ? "solid" : "outline"}
                  colorScheme={selectedModules.includes(m.id) ? "blue" : "gray"}
                  cursor="pointer"
                  onClick={() => toggleModule(m.id)}
                  _hover={{ opacity: 0.8 }}
                >
                  {m.label}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>

          <Button
            colorScheme="blue"
            leftIcon={<Play size={16} />}
            onClick={startQuiz}
            size="lg"
          >
            Empezar
          </Button>
        </Box>
      </Box>
    );
  }

  if (!quiz) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;

  const question = quiz.questions[current];
  const blankCount = question.blanks?.length ?? 0;
  const parts = (question.codeTemplate ?? "").split("___");

  const handleBlankChange = (index: number, value: string) => {
    const currentAnswers = codeFillAnswers[question.id] ?? new Array(blankCount).fill("");
    const next = [...currentAnswers];
    next[index] = value;
    setCodeFillAnswers((prev) => ({ ...prev, [question.id]: next }));
  };

  const currentAnswers = codeFillAnswers[question.id] ?? new Array(blankCount).fill("");

  const buildCode = () => {
    return parts.map((part, i) => {
      if (i < blankCount) {
        const answer = currentAnswers[i] || "/* ? */";
        return part + answer;
      }
      return part;
    }).join("");
  };

  const nextQuestion = () => {
    if (showFeedback) {
      setShowFeedback(false);
      setBlankCorrectness([]);
      if (current + 1 < quiz.questions.length) {
        setCurrent(current + 1);
      }
    } else {
      const correctness = (question.blanks ?? []).map((expected, i) => {
        const userVal = (currentAnswers[i] ?? "").trim().toLowerCase();
        return expected.trim().toLowerCase() === userVal;
      });
      setBlankCorrectness(correctness);
      setShowFeedback(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showFeedback) {
        nextQuestion();
      } else if (current + 1 < quiz.questions.length) {
        nextQuestion();
      }
    }
  };

  const prevQuestion = () => {
    if (current > 0 && !showFeedback) {
      setCurrent(current - 1);
    }
  };

  const submit = async () => {
    if (!showFeedback) {
      const correctness = (question.blanks ?? []).map((expected, i) => {
        const userVal = (currentAnswers[i] ?? "").trim().toLowerCase();
        return expected.trim().toLowerCase() === userVal;
      });
      setBlankCorrectness(correctness);
      setShowFeedback(true);
      return;
    }
    setSubmitting(true);
    try {
      const textAnswers: Record<string, string[]> = {};
      for (const q of quiz.questions) {
        if (codeFillAnswers[q.id]) {
          textAnswers[q.id] = codeFillAnswers[q.id];
        }
      }
      const answers = quiz.questions.map(() => []);
      setResult(await api.submitQuizV2(quiz.id, [MODULE_ID], answers, undefined, textAnswers, quiz.questions.map(q => q.id)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <QuizFeedback
        title="Rellenar Codigo - Resultado"
        result={result}
        onRetry={() => { setResult(null); setCurrent(0); setCodeFillAnswers({}); setStarted(false); setQuiz(null); setShowFeedback(false); setBlankCorrectness([]); }}
        onExit={onExit}
      />
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">
        Volver
      </Button>
      <Heading size="lg" mb={2}>Rellenar Codigo</Heading>
      <HStack spacing={3} mb={4}>
        <Tag colorScheme={DIFFICULTIES.find((d) => d.value === difficulty)?.color ?? "gray"}>
          {DIFFICULTIES.find((d) => d.value === difficulty)?.label}
        </Tag>
        <Text color={colors.textMuted}>
          Pregunta {current + 1} de {quiz.questions.length}
        </Text>
      </HStack>

      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
        <Text fontWeight="600" mb={4}>{question.text}</Text>

        <Box mb={4}>
          <Text fontSize="sm" color={colors.textMuted} mb={2} fontWeight={600}>
            Completa los blanks en el codigo:
          </Text>
          <CodeEditor code={buildCode()} readOnly />
        </Box>

        <Box mt={4}>
          <Text fontSize="sm" color={colors.textMuted} mb={2} fontWeight={600}>
            {showFeedback ? "Resultado:" : "Tus respuestas:"}
          </Text>
          <VStack align="stretch" spacing={2}>
            {Array.from({ length: blankCount }).map((_, i) => {
              const isCorrect = showFeedback ? (blankCorrectness[i] ?? false) : null;
              let inputBg = "gray.800";
              let inputBorder = "gray.600";
              if (showFeedback) {
                if (isCorrect) {
                  inputBg = "rgba(55, 195, 138, 0.15)";
                  inputBorder = colors.success;
                } else {
                  inputBg = "rgba(229, 83, 75, 0.15)";
                  inputBorder = colors.error;
                }
              }
              return (
                <HStack key={i} spacing={3}>
                  <Text fontSize="sm" color={colors.textMuted} minW="80px">
                    Blank {i + 1}:
                  </Text>
                  <Box
                    as="input"
                    flex={1}
                    value={currentAnswers[i] ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBlankChange(i, e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    bg={inputBg}
                    color="green.300"
                    border="1px solid"
                    borderColor={inputBorder}
                    borderRadius="6px"
                    px={3}
                    py={2}
                    fontFamily="monospace"
                    fontSize="sm"
                    disabled={showFeedback}
                    _focus={{ borderColor: colors.accent, outline: "none" }}
                  />
                  {showFeedback && isCorrect && <CheckCircle size={18} color={colors.success} />}
                  {showFeedback && !isCorrect && <XCircle size={18} color={colors.error} />}
                  {showFeedback && !isCorrect && (
                    <Text fontSize="xs" color={colors.textMuted} fontStyle="italic">
                      {question.blanks?.[i]}
                    </Text>
                  )}
                </HStack>
              );
            })}
          </VStack>
        </Box>

        {showFeedback && (
          <Box
            mt={4}
            p={3}
            bg={blankCorrectness.every(Boolean) ? "rgba(55, 195, 138, 0.1)" : "rgba(229, 83, 75, 0.1)"}
            border="1px solid"
            borderColor={blankCorrectness.every(Boolean) ? colors.success : colors.error}
            borderRadius="8px"
          >
            <Text fontSize="sm" fontWeight="600" color={blankCorrectness.every(Boolean) ? colors.success : colors.error}>
              {blankCorrectness.every(Boolean)
                ? "Correcta!"
                : `Incorrecta - ${blankCorrectness.filter(Boolean).length} de ${blankCorrectness.length} blanks correctos`}
            </Text>
          </Box>
        )}

        {showFeedback && question.explanation && (
          <Box mt={4} p={3} bg="gray.800" borderRadius="8px">
            <Text fontSize="sm" color={colors.textMuted}>
              <strong style={{ color: colors.accent }}>Explicacion:</strong> {question.explanation}
            </Text>
          </Box>
        )}
      </Box>

      <HStack spacing={3}>
        <Button variant="outline" isDisabled={current === 0 || showFeedback} onClick={prevQuestion}>
          Anterior
        </Button>
        {current + 1 < quiz.questions.length ? (
          <Button colorScheme="blue" onClick={nextQuestion}>
            {showFeedback ? "Siguiente" : "Verificar"}
          </Button>
        ) : (
          <Button
            colorScheme="green"
            leftIcon={<Play size={16} />}
            isLoading={submitting}
            onClick={submit}
          >
            {showFeedback ? "Enviar respuestas" : "Verificar"}
          </Button>
        )}
      </HStack>
    </Box>
  );
}

export default CodeFillPage;
