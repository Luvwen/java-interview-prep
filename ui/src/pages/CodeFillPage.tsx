import { useEffect, useState } from "react";
import {
  Box, Button, Heading, Text, VStack, Spinner, HStack,
} from "@chakra-ui/react";
import { ArrowLeft, Play } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuizFeedback from "../components/QuizFeedback";
import CodeEditor from "../components/CodeEditor";

const MODULE_ID = "code-fill";

function CodeFillPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [codeFillAnswers, setCodeFillAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getQuiz(MODULE_ID).then(setQuiz).catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <Text color={colors.error}>{error}</Text>;
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
    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const textAnswers: Record<string, string[]> = {};
      for (const q of quiz.questions) {
        if (codeFillAnswers[q.id]) {
          textAnswers[q.id] = codeFillAnswers[q.id];
        }
      }
      const answers = quiz.questions.map(() => []);
      setResult(await api.submitQuizV2(quiz.id, [MODULE_ID], answers, undefined, textAnswers));
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
        onRetry={() => { setResult(null); setCurrent(0); }}
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
      <Text color={colors.textMuted} mb={4}>
        Pregunta {current + 1} de {quiz.questions.length}
      </Text>

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
            Tus respuestas:
          </Text>
          <VStack align="stretch" spacing={2}>
            {Array.from({ length: blankCount }).map((_, i) => (
              <HStack key={i} spacing={3}>
                <Text fontSize="sm" color={colors.textMuted} minW="80px">
                  Blank {i + 1}:
                </Text>
                <Box
                  as="input"
                  flex={1}
                  value={currentAnswers[i] ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBlankChange(i, e.target.value)}
                  bg="gray.800"
                  color="green.300"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="6px"
                  px={3}
                  py={2}
                  fontFamily="monospace"
                  fontSize="sm"
                  _focus={{ borderColor: colors.accent, outline: "none" }}
                />
              </HStack>
            ))}
          </VStack>
        </Box>

        {question.explanation && (
          <Box mt={4} p={3} bg="gray.800" borderRadius="8px">
            <Text fontSize="sm" color={colors.textMuted}>
              <strong style={{ color: colors.accent }}>Explicacion:</strong> {question.explanation}
            </Text>
          </Box>
        )}
      </Box>

      <HStack spacing={3}>
        <Button variant="outline" isDisabled={current === 0} onClick={prevQuestion}>
          Anterior
        </Button>
        {current + 1 < quiz.questions.length ? (
          <Button colorScheme="blue" onClick={nextQuestion}>
            Siguiente
          </Button>
        ) : (
          <Button
            colorScheme="green"
            leftIcon={<Play size={16} />}
            isLoading={submitting}
            onClick={submit}
          >
            Enviar respuestas
          </Button>
        )}
      </HStack>
    </Box>
  );
}

export default CodeFillPage;
