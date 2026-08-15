import { useState, useEffect } from "react";
import {
  Box, Heading, Text, VStack, HStack, Badge, Button, Icon, SimpleGrid,
} from "@chakra-ui/react";
import { Beaker, ArrowLeft, Play } from "lucide-react";
import { colors } from "../colors";
import { api } from "../api";
import type { LabExercise } from "../types";
import LabRunner from "../components/LabRunner";

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "green",
  intermediate: "orange",
  hard: "red",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Facil",
  intermediate: "Intermedio",
  hard: "Dificil",
};

interface Props {
  onExit: () => void;
}

export default function LaboratorioPage({ onExit: _onExit }: Props) {
  const [exercises, setExercises] = useState<LabExercise[]>([]);
  const [selected, setSelected] = useState<LabExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.fetchLabExercises()
      .then((data) => { setExercises(data); setLoading(false); })
      .catch(() => { setError("No se pudieron cargar los ejercicios del laboratorio."); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Text color={colors.textMuted}>Cargando laboratorio...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.400">{error}</Text>
      </Box>
    );
  }

  if (selected) {
    return (
      <Box>
        <Button
          leftIcon={<ArrowLeft size={16} />}
          variant="ghost"
          color={colors.textMuted}
          onClick={() => setSelected(null)}
          mb={4}
          size="sm"
        >
          Volver a Laboratorio
        </Button>
        <LabRunner exercise={selected} />
      </Box>
    );
  }

  const categories = [...new Set(exercises.map(e => e.category))];
  const grouped = categories.map(cat => ({
    category: cat,
    items: exercises.filter(e => e.category === cat),
  }));

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <Box>
          <HStack spacing={3} mb={2}>
            <Icon as={Beaker} color={colors.accent} boxSize={6} />
            <Heading size="lg" color={colors.textPrimary}>
              Laboratorio
            </Heading>
          </HStack>
          <Text color={colors.textMuted} fontSize="sm">
            Ejecuta fragmentos de codigo Java y observa el comportamiento en tiempo real.
          </Text>
        </Box>

        {grouped.map(group => (
          <Box key={group.category}>
            <Heading size="sm" color={colors.accent} mb={3}>
              {group.category}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {group.items.map(ex => (
                <Box
                  key={ex.id}
                  bg={colors.surface}
                  border="1px solid"
                  borderColor={colors.border}
                  borderRadius="12px"
                  p={5}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ borderColor: colors.accent, transform: "translateY(-2px)" }}
                  onClick={() => setSelected(ex)}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="600" color={colors.textPrimary} fontSize="sm">
                      {ex.title}
                    </Text>
                    <Badge colorScheme={DIFFICULTY_COLOR[ex.difficulty]} fontSize="xs">
                      {DIFFICULTY_LABEL[ex.difficulty]}
                    </Badge>
                  </HStack>
                  <Text color={colors.textMuted} fontSize="xs" noOfLines={3}>
                    {ex.description}
                  </Text>
                  <HStack mt={3} spacing={2}>
                    <Icon as={Play} color={colors.accent} boxSize={3} />
                    <Text fontSize="xs" color={colors.accent} fontWeight="500">
                      Ejecutar
                    </Text>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
