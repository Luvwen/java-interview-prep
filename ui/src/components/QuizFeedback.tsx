import { Box, Button, Code, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { colors } from "../colors";
import type { QuestionFeedback as QF, QuizResult } from "../types";

interface QuizFeedbackProps {
  title: string;
  result: QuizResult;
  onRetry: () => void;
  onExit: () => void;
  retryLabel?: string;
}

function AnswerDisplay({ fb }: { fb: QF }) {
  const type = fb.questionType;

  if (type === "CODE_FILL") {
    return (
      <VStack align="stretch" spacing={1} mt={2}>
        {fb.userTextAnswer.map((ans, i) => (
          <HStack key={i} spacing={2} fontSize="xs">
            <Text color={colors.textMuted}>Blank {i + 1}:</Text>
            <Code bg={fb.correct ? "rgba(55,195,138,0.15)" : "rgba(229,83,75,0.15)"}
              color={fb.correct ? colors.success : colors.error} px={2} borderRadius="4px">
              {ans || "(vacio)"}
            </Code>
            {!fb.correct && fb.correctTextAnswer[i] && (
              <HStack spacing={1}>
                <Text color={colors.textMuted}>&rarr;</Text>
                <Code bg="rgba(108,140,255,0.15)" color={colors.accent} px={2} borderRadius="4px">
                  {fb.correctTextAnswer[i]}
                </Code>
              </HStack>
            )}
          </HStack>
        ))}
      </VStack>
    );
  }

  if (type === "ORDER") {
    const userOrder = fb.userAnswer.map(i => fb.options[i]).filter(Boolean);
    const correctOrder = fb.correctAnswer.map(i => fb.options[i]).filter(Boolean);
    return (
      <VStack align="stretch" spacing={1} mt={2} fontSize="xs">
        <HStack spacing={2}>
          <Text color={colors.textMuted} minW="60px">Tu orden:</Text>
          <Text color={fb.correct ? colors.success : colors.error}>
            {userOrder.length > 0 ? userOrder.join(" → ") : "(sin respuesta)"}
          </Text>
        </HStack>
        {!fb.correct && (
          <HStack spacing={2}>
            <Text color={colors.textMuted} minW="60px">Correcto:</Text>
            <Text color={colors.accent}>{correctOrder.join(" → ")}</Text>
          </HStack>
        )}
      </VStack>
    );
  }

  if (type === "TRUE_FALSE") {
    const userLabel = fb.userAnswer.length > 0 ? fb.options[fb.userAnswer[0]] : "(sin respuesta)";
    const correctLabel = fb.correctAnswer.length > 0 ? fb.options[fb.correctAnswer[0]] : "";
    return (
      <HStack spacing={2} mt={2} fontSize="xs">
        <Text color={colors.textMuted}>Tu respuesta:</Text>
        <Code bg={fb.correct ? "rgba(55,195,138,0.15)" : "rgba(229,83,75,0.15)"}
          color={fb.correct ? colors.success : colors.error} px={2} borderRadius="4px">
          {userLabel}
        </Code>
        {!fb.correct && (
          <HStack spacing={1}>
            <Text color={colors.textMuted}>&rarr;</Text>
            <Code bg="rgba(108,140,255,0.15)" color={colors.accent} px={2} borderRadius="4px">
              {correctLabel}
            </Code>
          </HStack>
        )}
      </HStack>
    );
  }

  if (type === "SINGLE" || type === "BUG_HUNT") {
    const userLabels = fb.userAnswer.map(i => fb.options[i]).filter(Boolean);
    const correctLabels = fb.correctAnswer.map(i => fb.options[i]).filter(Boolean);
    return (
      <VStack align="stretch" spacing={1} mt={2} fontSize="xs">
        <HStack spacing={2}>
          <Text color={colors.textMuted}>Tu respuesta:</Text>
          <Code bg={fb.correct ? "rgba(55,195,138,0.15)" : "rgba(229,83,75,0.15)"}
            color={fb.correct ? colors.success : colors.error} px={2} borderRadius="4px">
            {userLabels.length > 0 ? userLabels.join(", ") : "(sin respuesta)"}
          </Code>
        </HStack>
        {!fb.correct && (
          <HStack spacing={2}>
            <Text color={colors.textMuted}>Correcta:</Text>
            <Code bg="rgba(108,140,255,0.15)" color={colors.accent} px={2} borderRadius="4px">
              {correctLabels.join(", ")}
            </Code>
          </HStack>
        )}
      </VStack>
    );
  }

  if (type === "MULTIPLE") {
    const userLabels = fb.userAnswer.map(i => fb.options[i]).filter(Boolean);
    const correctLabels = fb.correctAnswer.map(i => fb.options[i]).filter(Boolean);
    return (
      <VStack align="stretch" spacing={1} mt={2} fontSize="xs">
        <HStack spacing={2} align="flex-start">
          <Text color={colors.textMuted} minW="90px">Tu respuesta:</Text>
          <VStack align="flex-start" spacing={0}>
            {userLabels.length > 0 ? userLabels.map((l, i) => (
              <Code key={i} bg="rgba(229,83,75,0.15)" color={colors.error} px={2} borderRadius="4px" mb={1}>
                {l}
              </Code>
            )) : <Text color={colors.error}>(sin respuesta)</Text>}
          </VStack>
        </HStack>
        {!fb.correct && (
          <HStack spacing={2} align="flex-start">
            <Text color={colors.textMuted} minW="90px">Correcta:</Text>
            <VStack align="flex-start" spacing={0}>
              {correctLabels.map((l, i) => (
                <Code key={i} bg="rgba(108,140,255,0.15)" color={colors.accent} px={2} borderRadius="4px" mb={1}>
                  {l}
                </Code>
              ))}
            </VStack>
          </HStack>
        )}
      </VStack>
    );
  }

  return null;
}

export default function QuizFeedback({
  title,
  result,
  onRetry,
  onExit,
  retryLabel = "Reintentar",
}: QuizFeedbackProps) {
  const percent = Math.round((result.score / result.total) * 100);

  return (
    <Box textAlign="center">
      <Heading size="lg" mb={4}>{title}</Heading>
      <Heading size="xl" color={result.passed ? colors.success : colors.error} mb={2}>
        {percent}% &mdash; {result.passed ? "Aprobado" : "Desaprobado"}
      </Heading>
      <Text color={colors.textMuted} mb={6}>
        {result.score} / {result.total} correctas
      </Text>
      <VStack align="stretch" spacing={3} mb={6} maxW="650px" mx="auto">
        {result.feedback.map((fb, i) => (
          <Box
            key={fb.questionId}
            bg={colors.surface}
            border="1px solid"
            borderColor={fb.correct ? colors.success : colors.error}
            borderRadius="10px"
            p={4}
            textAlign="left"
          >
            <Text fontWeight="600" mb={1}>
              {i + 1}. {fb.questionText?.substring(0, 80)}{fb.questionText && fb.questionText.length > 80 ? "..." : ""}
            </Text>
            <HStack spacing={2} mb={2}>
              <Text fontSize="xs" color={colors.textMuted} textTransform="uppercase" fontWeight={600}>
                {fb.questionType?.replace("_", " ")}
              </Text>
              <Text fontSize="xs" fontWeight="600" color={fb.correct ? colors.success : colors.error}>
                {fb.correct ? "Correcta" : "Incorrecta"}
              </Text>
            </HStack>
            <AnswerDisplay fb={fb} />
            <Text fontSize="sm" color={colors.textMuted} mt={2}>{fb.explanation}</Text>
          </Box>
        ))}
      </VStack>
      <HStack justify="center" spacing={3}>
        <Button colorScheme="blue" onClick={onRetry}>{retryLabel}</Button>
        <Button variant="outline" onClick={onExit}>Volver</Button>
      </HStack>
    </Box>
  );
}
