import {
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  Radio,
  Stack,
  Text,
  Badge,
  VStack,
} from "@chakra-ui/react";
import type { QuestionType } from "../types";
import { colors } from "../colors";
import OrderQuestion from "./OrderQuestion";

const typeLabels: Record<QuestionType, string> = {
  SINGLE: "Opcion unica",
  MULTIPLE: "Opcion multiple",
  TRUE_FALSE: "Verdadero o falso",
  ORDER: "Ordenar bloques",
  CODE_FILL: "Rellenar codigo",
  BUG_HUNT: "Encontrar bug",
};

interface QuestionRendererProps {
  questionIndex: number;
  question: {
    id: string;
    text: string;
    options: string[];
    type: QuestionType;
    codeTemplate?: string;
    blanks?: string[];
    code?: string;
  };
  selectedIndices: number[];
  onToggle: (optionIndex: number) => void;
  onOrderChange?: (order: number[]) => void;
  onCodeFillChange?: (questionId: string, answers: string[]) => void;
  codeFillAnswers?: string[];
}

export default function QuestionRenderer({
  questionIndex,
  question,
  selectedIndices,
  onToggle,
  onOrderChange,
  onCodeFillChange,
  codeFillAnswers,
}: QuestionRendererProps) {
  return (
    <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5}>
      <Text fontWeight="600" mb={3}>
        {questionIndex + 1}. {question.text}
        <Badge ml={2} fontSize="xs" variant="subtle" colorScheme="gray">
          {typeLabels[question.type]}
        </Badge>
      </Text>
      <QuestionBody
        question={question}
        selectedIndices={selectedIndices}
        onToggle={onToggle}
        onOrderChange={onOrderChange}
        onCodeFillChange={onCodeFillChange}
        codeFillAnswers={codeFillAnswers}
      />
    </Box>
  );
}

interface QuestionBodyProps {
  question: {
    id: string;
    options: string[];
    type: QuestionType;
    codeTemplate?: string;
    blanks?: string[];
    code?: string;
  };
  selectedIndices: number[];
  onToggle: (optionIndex: number) => void;
  onOrderChange?: (order: number[]) => void;
  onCodeFillChange?: (questionId: string, answers: string[]) => void;
  codeFillAnswers?: string[];
}

export function QuestionBody({
  question,
  selectedIndices,
  onToggle,
  onOrderChange,
  onCodeFillChange,
  codeFillAnswers,
}: QuestionBodyProps) {
  if (question.type === "CODE_FILL") {
    return (
      <CodeFillBody
        question={question}
        onCodeFillChange={onCodeFillChange}
        codeFillAnswers={codeFillAnswers}
      />
    );
  }

  if (question.type === "BUG_HUNT") {
    return (
      <BugHuntBody
        question={question}
        selectedIndices={selectedIndices}
        onToggle={onToggle}
      />
    );
  }

  if (question.type === "TRUE_FALSE") {
    return (
      <HStack spacing={3}>
        {question.options.map((option, oIndex) => (
          <Button
            key={oIndex}
            size="sm"
            variant={selectedIndices.includes(oIndex) ? "solid" : "outline"}
            colorScheme={selectedIndices.includes(oIndex) ? "blue" : "gray"}
            onClick={() => onToggle(oIndex)}
          >
            {option}
          </Button>
        ))}
      </HStack>
    );
  }

  if (question.type === "ORDER" && onOrderChange) {
    return (
      <OrderQuestion
        options={question.options}
        value={selectedIndices.length > 0 ? selectedIndices : question.options.map((_, i) => i)}
        onChange={onOrderChange}
      />
    );
  }

  const isSingle = question.type === "SINGLE";

  return (
    <Stack spacing={2}>
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
          bg={selectedIndices.includes(oIndex) ? colors.surfaceHover : "transparent"}
          border="1px solid"
          borderColor={selectedIndices.includes(oIndex) ? colors.borderSelected : "transparent"}
        >
          {isSingle ? (
            <Radio
              name={question.id}
              isChecked={selectedIndices[0] === oIndex}
              onChange={() => onToggle(oIndex)}
              colorScheme="blue"
            />
          ) : (
            <Checkbox
              isChecked={selectedIndices.includes(oIndex)}
              onChange={() => onToggle(oIndex)}
              colorScheme="blue"
            />
          )}
          <Text fontSize="sm">{option}</Text>
        </Box>
      ))}
    </Stack>
  );
}

function CodeFillBody({
  question,
  onCodeFillChange,
  codeFillAnswers,
}: {
  question: { id: string; codeTemplate?: string; blanks?: string[] };
  onCodeFillChange?: (questionId: string, answers: string[]) => void;
  codeFillAnswers?: string[];
}) {
  const template = question.codeTemplate ?? "";
  const blankCount = question.blanks?.length ?? 0;
  const parts = template.split("___");

  const handleChange = (index: number, value: string) => {
    if (!onCodeFillChange) return;
    const current = codeFillAnswers ?? new Array(blankCount).fill("");
    const next = [...current];
    next[index] = value;
    onCodeFillChange(question.id, next);
  };

  return (
    <VStack align="stretch" spacing={3}>
      <Box
        bg="gray.900"
        color="green.300"
        p={4}
        borderRadius="8px"
        fontFamily="monospace"
        fontSize="sm"
        whiteSpace="pre-wrap"
        lineHeight="tall"
      >
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < blankCount && (
              <Input
                size="xs"
                width={`${Math.max(6, (codeFillAnswers?.[i] ?? "").length + 4)}ch`}
                variant="filled"
                bg="gray.700"
                color="white"
                _placeholder={{ color: "gray.500" }}
                placeholder="?"
                value={codeFillAnswers?.[i] ?? ""}
                onChange={(e) => handleChange(i, e.target.value)}
                fontFamily="monospace"
                display="inline"
                px={1}
                mx={1}
              />
            )}
          </span>
        ))}
      </Box>
    </VStack>
  );
}

function BugHuntBody({
  question,
  selectedIndices,
  onToggle,
}: {
  question: { id: string; options: string[]; code?: string };
  selectedIndices: number[];
  onToggle: (optionIndex: number) => void;
}) {
  return (
    <VStack align="stretch" spacing={3}>
      {question.code && (
        <Box
          as="pre"
          bg="gray.900"
          color="green.300"
          p={4}
          borderRadius="8px"
          fontFamily="monospace"
          fontSize="xs"
          whiteSpace="pre"
          lineHeight="tall"
          overflowX="auto"
          m={0}
        >
          {question.code.split("\n").map((line, i) => (
            <span key={i}>
              <span style={{ color: "#666", marginRight: "1em", userSelect: "none" }}>
                {String(i + 1).padStart(2, " ")}
              </span>
              {line + "\n"}
            </span>
          ))}
        </Box>
      )}
      <Text fontSize="sm" color={colors.textMuted} fontWeight="600">
        Selecciona la linea con el bug:
      </Text>
      <Stack spacing={2}>
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
            bg={selectedIndices.includes(oIndex) ? colors.surfaceHover : "transparent"}
            border="1px solid"
            borderColor={selectedIndices.includes(oIndex) ? colors.borderSelected : "transparent"}
          >
            <Radio
              name={question.id}
              isChecked={selectedIndices[0] === oIndex}
              onChange={() => onToggle(oIndex)}
              colorScheme="blue"
            />
            <Text fontSize="sm">{option}</Text>
          </Box>
        ))}
      </Stack>
    </VStack>
  );
}
