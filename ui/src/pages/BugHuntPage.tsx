import { useState } from "react";
import {
  Box, Button, Heading, Text, VStack, Spinner, HStack, Tag, Wrap, WrapItem, Radio,
} from "@chakra-ui/react";
import { ArrowLeft, Play, CheckCircle, XCircle } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuizFeedback from "../components/QuizFeedback";
import CodeEditor from "../components/CodeEditor";

const MODULE_ID = "bug-hunt";

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

function BugHuntPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState(false);

  const [difficulty, setDifficulty] = useState<string>("easy");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [started, setStarted] = useState(false);

  const startQuiz = () => {
    setStarted(true);
    api.getQuiz(MODULE_ID, difficulty, selectedModules.length > 0 ? selectedModules : undefined)
      .then((q) => {
        setQuiz(q);
        setAnswers(q.questions.map(() => []));
      })
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
        <Heading size="lg" mb={2}>Encontrar el Bug</Heading>
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

  const nextQuestion = () => {
    if (showFeedback) {
      const newAnswers = [...answers];
      newAnswers[current] = selected;
      setAnswers(newAnswers);
      setSelected([]);
      setShowFeedback(false);
      if (current + 1 < quiz.questions.length) {
        setCurrent(current + 1);
      }
    } else {
      const correct = question.correctIndexes
        ? JSON.stringify([...selected].sort()) === JSON.stringify([...question.correctIndexes].sort())
        : false;
      setCurrentCorrect(correct);
      setShowFeedback(true);
    }
  };

  const prevQuestion = () => {
    if (current > 0 && !showFeedback) {
      setSelected(answers[current - 1] ?? []);
      setCurrent(current - 1);
    }
  };

  const submit = async () => {
    if (!showFeedback) {
      const correct = question.correctIndexes
        ? JSON.stringify([...selected].sort()) === JSON.stringify([...question.correctIndexes].sort())
        : false;
      setCurrentCorrect(correct);
      setShowFeedback(true);
      return;
    }
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSubmitting(true);
    try {
      setResult(await api.submitQuizV2(quiz.id, [MODULE_ID], newAnswers, undefined, undefined, quiz.questions.map(q => q.id)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <QuizFeedback
        title="Encontrar el Bug - Resultado"
        result={result}
        onRetry={() => { setResult(null); setCurrent(0); setAnswers([]); setSelected([]); setStarted(false); setQuiz(null); setShowFeedback(false); setCurrentCorrect(false); }}
        onExit={onExit}
      />
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">
        Volver
      </Button>
      <Heading size="lg" mb={2}>Encontrar el Bug</Heading>
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

        {question.code && (
          <Box mb={4}>
            <Text fontSize="sm" color={colors.textMuted} mb={2} fontWeight={600}>
              Analiza el siguiente codigo:
            </Text>
            <CodeEditor
              code={question.code}
              readOnly
            />
          </Box>
        )}

        <Box mt={4}>
          <Text fontSize="sm" color={colors.textMuted} mb={2} fontWeight={600}>
            {showFeedback ? (currentCorrect ? "Tu respuesta:" : "Resultado:") : "Selecciona la opcion que describe el bug:"}
          </Text>
          <VStack align="stretch" spacing={2}>
            {question.options.map((option, oIndex) => {
              const isSelected = selected.includes(oIndex);
              const isCorrectOption = question.correctIndexes?.includes(oIndex) ?? false;
              let bg = "transparent";
              let borderClr = "transparent";
              if (showFeedback) {
                if (isCorrectOption) {
                  bg = "rgba(55, 195, 138, 0.15)";
                  borderClr = colors.success;
                } else if (isSelected && !currentCorrect) {
                  bg = "rgba(229, 83, 75, 0.15)";
                  borderClr = colors.error;
                }
              } else {
                if (isSelected) {
                  bg = colors.surfaceHover;
                  borderClr = colors.borderSelected;
                }
              }
              return (
                <Box
                  key={oIndex}
                  as="label"
                  display="flex"
                  alignItems="center"
                  gap={3}
                  p={3}
                  borderRadius="8px"
                  cursor={showFeedback ? "default" : "pointer"}
                  _hover={showFeedback ? {} : { bg: colors.surfaceHover }}
                  bg={bg}
                  border="1px solid"
                  borderColor={borderClr}
                >
                  <Radio
                    name={question.id}
                    isChecked={isSelected}
                    onChange={() => !showFeedback && setSelected([oIndex])}
                    colorScheme="blue"
                    isDisabled={showFeedback}
                  />
                  <Text fontSize="sm" flex={1}>{option}</Text>
                  {showFeedback && isCorrectOption && <CheckCircle size={18} color={colors.success} />}
                  {showFeedback && isSelected && !isCorrectOption && <XCircle size={18} color={colors.error} />}
                </Box>
              );
            })}
          </VStack>
        </Box>

        {showFeedback && (
          <Box
            mt={4}
            p={3}
            bg={currentCorrect ? "rgba(55, 195, 138, 0.1)" : "rgba(229, 83, 75, 0.1)"}
            border="1px solid"
            borderColor={currentCorrect ? colors.success : colors.error}
            borderRadius="8px"
          >
            <Text fontSize="sm" fontWeight="600" color={currentCorrect ? colors.success : colors.error}>
              {currentCorrect ? "Correcta!" : "Incorrecta"}
            </Text>
            {!currentCorrect && question.correctIndexes && question.correctIndexes.length > 0 && (
              <Text fontSize="sm" color={colors.textMuted} mt={1}>
                La respuesta correcta es: <strong style={{ color: colors.success }}>{question.options[question.correctIndexes[0]]}</strong>
              </Text>
            )}
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
          <Button colorScheme="blue" isDisabled={!showFeedback && selected.length === 0} onClick={nextQuestion}>
            {showFeedback ? "Siguiente" : "Verificar"}
          </Button>
        ) : (
          <Button
            colorScheme="green"
            leftIcon={<Play size={16} />}
            isDisabled={!showFeedback && selected.length === 0}
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

export default BugHuntPage;
