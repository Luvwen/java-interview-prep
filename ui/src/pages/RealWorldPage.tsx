import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Badge,
  Icon,
  Collapse,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { colors } from "../colors";
import { api } from "../api";
import type { RealWorldCase } from "../types";
import CodeBlock from "../components/CodeBlock";

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: "green",
  intermediate: "orange",
  advanced: "red",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

interface Props {
  onExit: () => void;
}

export default function RealWorldPage({ onExit: _onExit }: Props) {
  const [cases, setCases] = useState<RealWorldCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<RealWorldCase | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
  const [showSolutions, setShowSolutions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .fetchRealWorldCases()
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los casos reales.");
        setLoading(false);
      });
  }, []);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleExercise = (idx: number) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const toggleSolution = (idx: number) => {
    setShowSolutions((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Text color={colors.textMuted}>Cargando casos reales...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" bg={colors.surface} borderRadius="12px" border="1px solid" borderColor={colors.border}>
        <AlertIcon color="red.400" />
        <Text color={colors.textPrimary}>{error}</Text>
      </Alert>
    );
  }

  if (selectedCase) {
    return (
      <Box>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="ghost"
          color={colors.textMuted}
          onClick={() => setSelectedCase(null)}
          mb={4}
          size="sm"
        >
          Volver a Casos
        </Button>

        <VStack align="stretch" spacing={6}>
          <Box>
            <HStack mb={2} spacing={3}>
              <Heading size="lg" color={colors.textPrimary}>
                {selectedCase.title}
              </Heading>
              <Badge colorScheme={DIFFICULTY_COLOR[selectedCase.difficulty]} fontSize="xs">
                {DIFFICULTY_LABEL[selectedCase.difficulty]}
              </Badge>
            </HStack>
            <Badge colorScheme="blue" fontSize="xs" mb={3}>
              {selectedCase.category}
            </Badge>
            <Text color={colors.textMuted} fontSize="sm" mt={2}>
              {selectedCase.problem}
            </Text>
          </Box>

          <Box>
            <Heading size="sm" color={colors.accent} mb={3}>
              Resolucion paso a paso
            </Heading>
            <VStack align="stretch" spacing={3}>
              {selectedCase.sections.map((section, i) => (
                <Box
                  key={i}
                  bg={colors.surface}
                  border="1px solid"
                  borderColor={colors.border}
                  borderRadius="10px"
                  overflow="hidden"
                >
                  <HStack
                    justify="space-between"
                    p={4}
                    cursor="pointer"
                    onClick={() => toggleSection(i)}
                  >
                    <HStack spacing={3}>
                      <Box
                        bg={colors.accent}
                        color="white"
                        borderRadius="50%"
                        minW="28px"
                        h="28px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {i + 1}
                      </Box>
                      <Text fontWeight="600" color={colors.textPrimary} fontSize="sm">
                        {section.title}
                      </Text>
                    </HStack>
                    <Icon
                      as={expandedSections.has(i) ? ChevronUp : ChevronDown}
                      color={colors.textMuted}
                      boxSize={4}
                    />
                  </HStack>
                  <Collapse in={expandedSections.has(i)} animateOpacity>
                    <Box px={4} pb={4}>
                      <Text color={colors.textMuted} fontSize="sm" mb={3} whiteSpace="pre-line">
                        {section.text}
                      </Text>
                      {section.code && <CodeBlock code={section.code} />}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box>
            <Heading size="sm" color={colors.accent} mb={3}>
              <HStack spacing={2}>
                <Icon as={Lightbulb} boxSize={4} />
                <Text>Puntos Clave para Entrevistas</Text>
              </HStack>
            </Heading>
            <VStack align="stretch" spacing={2}>
              {selectedCase.keyPoints.map((point, i) => (
                <HStack key={i} align="flex-start" spacing={2}>
                  <Icon as={CheckCircle2} color="green.400" boxSize={4} mt={0.5} />
                  <Text color={colors.textMuted} fontSize="sm">
                    {point}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {selectedCase.interviewQuestions.length > 0 && (
            <Box>
              <Heading size="sm" color={colors.accent} mb={3}>
                <HStack spacing={2}>
                  <Icon as={MessageCircle} boxSize={4} />
                  <Text>Preguntas de Entrevista</Text>
                </HStack>
              </Heading>
              <VStack align="stretch" spacing={2}>
                {selectedCase.interviewQuestions.map((q, i) => (
                  <HStack key={i} align="flex-start" spacing={2}>
                    <Text color={colors.accent} fontSize="sm" fontWeight="bold">
                      Q{i + 1}.
                    </Text>
                    <Text color={colors.textMuted} fontSize="sm">
                      {q}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          <Box>
            <Heading size="sm" color={colors.accent} mb={3}>
              Ejercicios
            </Heading>
            <VStack align="stretch" spacing={3}>
              {selectedCase.exercises.map((ex, i) => (
                <Box
                  key={i}
                  bg={colors.surface}
                  border="1px solid"
                  borderColor={colors.border}
                  borderRadius="10px"
                  overflow="hidden"
                >
                  <HStack
                    justify="space-between"
                    p={4}
                    cursor="pointer"
                    onClick={() => toggleExercise(i)}
                  >
                    <VStack align="flex-start" spacing={1}>
                      <Text fontWeight="600" color={colors.textPrimary} fontSize="sm">
                        Ejercicio {i + 1}: {ex.title}
                      </Text>
                      <Text color={colors.textMuted} fontSize="xs">
                        {ex.description}
                      </Text>
                    </VStack>
                    <Icon
                      as={expandedExercises.has(i) ? ChevronUp : ChevronDown}
                      color={colors.textMuted}
                      boxSize={4}
                    />
                  </HStack>
                  <Collapse in={expandedExercises.has(i)} animateOpacity>
                    <Box px={4} pb={4}>
                      {ex.hints.length > 0 && (
                        <Box mb={3}>
                          <Text fontSize="xs" color={colors.textMuted} fontWeight="bold" mb={1}>
                            Pistas:
                          </Text>
                          {ex.hints.map((hint, j) => (
                            <Text key={j} fontSize="xs" color={colors.textMuted} ml={2}>
                              - {hint}
                            </Text>
                          ))}
                        </Box>
                      )}
                      {ex.solution && (
                        <Box>
                          <Button
                            size="xs"
                            variant="ghost"
                            color={colors.accent}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSolution(i);
                            }}
                            leftIcon={<ChevronDown size={12} />}
                          >
                            {showSolutions.has(i) ? "Ocultar solucion" : "Ver solucion"}
                          </Button>
                          <Collapse in={showSolutions.has(i)} animateOpacity>
                            <VStack align="stretch" spacing={3} mt={3}>
                              {ex.solution.files.map((file, k) => (
                                <Box key={k}>
                                  <Text fontSize="xs" color={colors.textMuted} mb={1}>
                                    {file.path}
                                  </Text>
                                  <CodeBlock code={file.code} />
                                </Box>
                              ))}
                            </VStack>
                          </Collapse>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  const categories = [...new Set(cases.map((c) => c.category))];
  const grouped = categories.map((cat) => ({
    category: cat,
    items: cases.filter((c) => c.category === cat),
  }));

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Briefcase} color={colors.accent} boxSize={6} />
            <Heading size="lg" color={colors.textPrimary}>
              Casos Reales del Dia a Dia
            </Heading>
          </HStack>
          <Text color={colors.textMuted} fontSize="sm">
            Situaciones cotidianas que enfrenta un programador Java backend, resueltas con las mejores practicas.
          </Text>
        </Box>

        {grouped.map((group) => (
          <Box key={group.category}>
            <Heading size="sm" color={colors.accent} mb={3}>
              {group.category}
            </Heading>
            <VStack align="stretch" spacing={3}>
              {group.items.map((c) => (
                <Box
                  key={c.id}
                  bg={colors.surface}
                  border="1px solid"
                  borderColor={colors.border}
                  borderRadius="12px"
                  p={5}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ borderColor: colors.accent, transform: "translateY(-2px)" }}
                  onClick={() => setSelectedCase(c)}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="600" color={colors.textPrimary} fontSize="sm">
                      {c.title}
                    </Text>
                    <Badge colorScheme={DIFFICULTY_COLOR[c.difficulty]} fontSize="xs">
                      {DIFFICULTY_LABEL[c.difficulty]}
                    </Badge>
                  </HStack>
                  <Text color={colors.textMuted} fontSize="xs" noOfLines={2}>
                    {c.problem}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
