import {
  Box,
  Button,
  Checkbox,
  HStack,
  Radio,
  Stack,
  Text,
  Badge,
} from "@chakra-ui/react";
import type { QuestionType } from "../types";
import { colors } from "../colors";
import OrderQuestion from "./OrderQuestion";

const typeLabels: Record<QuestionType, string> = {
  SINGLE: "Opcion unica",
  MULTIPLE: "Opcion multiple",
  TRUE_FALSE: "Verdadero o falso",
  ORDER: "Ordenar bloques",
};

interface QuestionRendererProps {
  questionIndex: number;
  question: {
    id: string;
    text: string;
    options: string[];
    type: QuestionType;
  };
  selectedIndices: number[];
  onToggle: (optionIndex: number) => void;
  onOrderChange?: (order: number[]) => void;
}

export default function QuestionRenderer({
  questionIndex,
  question,
  selectedIndices,
  onToggle,
  onOrderChange,
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
      />
    </Box>
  );
}

interface QuestionBodyProps {
  question: {
    id: string;
    options: string[];
    type: QuestionType;
  };
  selectedIndices: number[];
  onToggle: (optionIndex: number) => void;
  onOrderChange?: (order: number[]) => void;
}

export function QuestionBody({
  question,
  selectedIndices,
  onToggle,
  onOrderChange,
}: QuestionBodyProps) {
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
