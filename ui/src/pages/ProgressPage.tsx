import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Progress,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { api } from "../api";
import { colors } from "../colors";
import type { Progress as ProgressType } from "../types";
import StateBadge from "../components/StateBadge";

function ProgressPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const loadProgress = () => api.getProgress().then(setProgress).catch((err: Error) => setError(err.message));

  useEffect(() => { loadProgress(); }, []);

  const resetProgress = async () => {
    if (!confirm("Esto borrara todo tu progreso. Estas seguro?")) return;
    setResetting(true);
    try { await api.resetProgress(); await loadProgress(); }
    catch (err) { setError((err as Error).message); }
    finally { setResetting(false); }
  };

  if (error) return <Text color={colors.error}>{error}</Text>;
  if (!progress) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;

  const entries = Object.entries(progress.moduleStates);
  const completed = entries.filter(([, state]) => state === "COMPLETED").length;

  return (
    <Box>
      <Heading size="lg" mb={6}>Progreso</Heading>
      <Flex align="center" gap={4} mb={2}>
        <Progress value={progress.overallPercent} size="lg" colorScheme="green" borderRadius="full" flex={1} bg={colors.surfaceHover} />
        <Text fontWeight="600" minW="80px" textAlign="right">{progress.overallPercent}% global</Text>
      </Flex>
      <Text color={colors.textMuted} mb={6}>{completed} de {entries.length} modulos completados</Text>

      <List spacing={3}>
        {entries.map(([id, state]) => (
          <ListItem key={id} display="flex" alignItems="center" justifyContent="space-between" bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="10px" px={4} py={3}>
            <Button variant="link" color={colors.accent} onClick={() => onOpenModule(id)}>{id}</Button>
            <StateBadge state={state} />
          </ListItem>
        ))}
      </List>

      <Button variant="outline" mt={8} isDisabled={resetting} onClick={resetProgress}>
        {resetting ? "Reseteando..." : "Resetear progreso"}
      </Button>
    </Box>
  );
}

export default ProgressPage;
