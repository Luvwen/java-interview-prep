import { useEffect, useState } from "react";
import { Box, Heading, SimpleGrid, Text, Spinner, VStack } from "@chakra-ui/react";
import { api } from "../api";
import { colors } from "../colors";
import type { ModuleSummary } from "../types";
import StateBadge from "../components/StateBadge";

function CatalogPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listModules().then(setModules).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;
  if (error) return <Text color={colors.error}>{error}</Text>;

  return (
    <Box>
      <Heading size="lg" mb={6}>Modulos</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {modules.map((module) => (
          <Box
            key={module.id}
            as="button"
            textAlign="left"
            bg={colors.surface}
            border="1px solid"
            borderColor={colors.border}
            borderRadius="12px"
            p={5}
            cursor="pointer"
            transition="all 0.15s"
            _hover={{ borderColor: colors.accent, transform: "translateY(-2px)" }}
            onClick={() => onOpenModule(module.id)}
          >
            <VStack align="start" spacing={2}>
              <StateBadge state={module.state} />
              <Heading size="sm">{module.title}</Heading>
              <Text fontSize="sm" color={colors.textMuted} noOfLines={2}>{module.description}</Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default CatalogPage;
