import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { api } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, ModuleState } from "../types";
import StateBadge from "../components/StateBadge";
import { SkeletonCard } from "../components/Skeletons";

function CatalogPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listModules(), api.getProgress()])
      .then(([backendModules, progress]) => {
        const merged = backendModules.map((m) => ({
          ...m,
          state: (progress.moduleStates[m.id] as ModuleState) ?? m.state,
        }));
        setModules(merged);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box>
      <Heading size="lg" mb={2} letterSpacing="-0.02em">Modulos</Heading>
      <Text color={colors.textMuted} mb={6}>Aprende Java desde los fundamentos hasta frameworks avanzados.</Text>
      <SkeletonCard count={6} />
    </Box>
  );
  if (error) return <Text color={colors.error}>{error}</Text>;

  return (
    <Box>
      <Heading size="lg" mb={2} letterSpacing="-0.02em">Modulos</Heading>
      <Text color={colors.textMuted} mb={6}>Aprende Java desde los fundamentos hasta frameworks avanzados.</Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
        {modules.map((module) => (
          <Box
            key={module.id}
            as="button"
            textAlign="left"
            bg={colors.gradient}
            border="1px solid"
            borderColor={colors.border}
            borderRadius="16px"
            p={5}
            cursor="pointer"
            transition="all 0.2s ease"
            boxShadow={colors.shadow}
            _hover={{ borderColor: colors.accent, transform: "translateY(-3px)", boxShadow: colors.shadowLg }}
            onClick={() => onOpenModule(module.id)}
          >
            <VStack align="start" spacing={2}>
              <StateBadge state={module.state} />
              <Heading size="sm" letterSpacing="-0.01em">{module.title}</Heading>
              <Text fontSize="sm" color={colors.textMuted} noOfLines={2}>{module.description}</Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default CatalogPage;
