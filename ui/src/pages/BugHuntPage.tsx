import { useEffect, useState } from "react";
import {
  Box, Button, Heading, Text, VStack, Spinner, HStack, Radio,
} from "@chakra-ui/react";
import { ArrowLeft, Play } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { Quiz, QuizResult } from "../types";
import QuizFeedback from "../components/QuizFeedback";
import CodeEditor from "../components/CodeEditor";

const MODULE_ID = "bug-hunt";

function BugHuntPage({ onExit }: { onExit: () => void }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getQuiz(MODULE_ID).then((q) => {
      setQuiz(q);
      setAnswers(q.questions.map(() => []));
    }).catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <Text color={colors.error}>{error}</Text>;
  if (!quiz) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;

  const question = quiz.questions[current];

  const nextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSelected([]);
    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setSelected(answers[current - 1] ?? []);
      setCurrent(current - 1);
    }
  };

  const submit = async () => {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setSubmitting(true);
    try {
      setResult(await api.submitQuizV2(quiz.id, [MODULE_ID], newAnswers));
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
        onRetry={() => { setResult(null); setCurrent(0); setAnswers([]); setSelected([]); }}
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
      <Text color={colors.textMuted} mb={4}>
        Pregunta {current + 1} de {quiz.questions.length}
      </Text>

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
            Selecciona la opcion que describe el bug:
          </Text>
          <VStack align="stretch" spacing={2}>
            {question.options.map((option, oIndex) => (
              <Box
                key={oIndex}
                as="label"
                display="flex"
                alignItems="center"
                gap={3}
                p={3}
                borderRadius="8px"
                cursor="pointer"
                _hover={{ bg: colors.surfaceHover }}
                bg={selected.includes(oIndex) ? colors.surfaceHover : "transparent"}
                border="1px solid"
                borderColor={selected.includes(oIndex) ? colors.borderSelected : "transparent"}
              >
                <Radio
                  name={question.id}
                  isChecked={selected[0] === oIndex}
                  onChange={() => setSelected([oIndex])}
                  colorScheme="blue"
                />
                <Text fontSize="sm">{option}</Text>
              </Box>
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
          <Button colorScheme="blue" isDisabled={selected.length === 0} onClick={nextQuestion}>
            Siguiente
          </Button>
        ) : (
          <Button
            colorScheme="green"
            leftIcon={<Play size={16} />}
            isDisabled={selected.length === 0}
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

export default BugHuntPage;
