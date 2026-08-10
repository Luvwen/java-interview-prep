import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { colors } from "../colors";
import type { QuizResult } from "../types";

interface QuizFeedbackProps {
  title: string;
  result: QuizResult;
  onRetry: () => void;
  onExit: () => void;
  retryLabel?: string;
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
      <VStack align="stretch" spacing={3} mb={6} maxW="600px" mx="auto">
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
              {i + 1}. {fb.correct ? "Correcta" : "Incorrecta"}
            </Text>
            <Text fontSize="sm" color={colors.textMuted}>{fb.explanation}</Text>
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
