import { useEffect, useState } from "react";
import {
  Box, Button, Checkbox, Flex, Heading, Stack, Text, HStack,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, ModuleDetail } from "../types";
import FlipCard from "../components/FlipCard";

interface Flashcard { moduleId: string; moduleTitle: string; topicId: string; title: string; content: string; }

function FlashcardsPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => { api.listModules().then(setModules).catch((err: Error) => setError(err.message)); }, []);

  const shuffle = <T,>(arr: T[]) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } };

  const startSession = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true); setError(null);
    try {
      const allCards: Flashcard[] = [];
      for (const moduleId of selectedModules) {
        const detail: ModuleDetail = await api.getModule(moduleId);
        const mod = modules.find((m) => m.id === moduleId);
        for (const topic of detail.topics) {
          allCards.push({ moduleId, moduleTitle: mod?.title ?? moduleId, topicId: topic.id, title: topic.title, content: topic.content.substring(0, 300) + (topic.content.length > 300 ? "..." : "") });
        }
      }
      shuffle(allCards); setCards(allCards); setCurrentIndex(0); setKnown([]); setUnknown([]); setSessionDone(false);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const markKnown = () => { setKnown((prev) => [...prev, cards[currentIndex].topicId]); advance(); };
  const markUnknown = () => { setUnknown((prev) => [...prev, cards[currentIndex].topicId]); advance(); };
  const advance = () => { if (currentIndex + 1 < cards.length) setCurrentIndex(currentIndex + 1); else setSessionDone(true); };
  const toggleModule = (id: string) => setSelectedModules((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  if (error) return <Text color={colors.error}>{error}</Text>;

  if (sessionDone) {
    return (
      <Box textAlign="center">
        <Heading size="lg" mb={4}>Sesion de Flashcards</Heading>
        <Text color={colors.textMuted} mb={6}>{known.length} sabia / {unknown.length} no sabia</Text>
        {unknown.length > 0 && <Text color={colors.textMuted} mb={4}>Repasa los temas que marcaste como "no sabia" para reforzar.</Text>}
        <HStack justify="center" spacing={3}>
          <Button colorScheme="blue" onClick={startSession}>Repetir sesion</Button>
          <Button variant="outline" onClick={onExit}>Volver</Button>
        </HStack>
      </Box>
    );
  }

  if (cards.length > 0) {
    const card = cards[currentIndex];
    return (
      <Box textAlign="center">
        <Text color={colors.textMuted} mb={2}>{currentIndex + 1} / {cards.length}</Text>
        <Text color={colors.textMuted} mb={4}>{card.moduleTitle}</Text>
        <FlipCard front={card.title} back={card.content} onKnow={markKnown} onDontKnow={markUnknown} />
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
      <Heading size="lg" mb={2}>Flashcards</Heading>
      <Text color={colors.textMuted} mb={6}>Voltea las tarjetas y autoevalua si sabias el contenido. Las tarjetas que marques como "no sabia" volveran a aparecer al final de la sesion.</Text>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} mb={4}>
        <Flex align="center" justify="space-between" mb={3}>
          <Heading size="sm">Modulos</Heading>
          <Button variant="link" size="sm" color={colors.accent} onClick={() => setSelectedModules(modules.map((m) => m.id))}>Seleccionar todos</Button>
        </Flex>
        <Stack spacing={2}>
          {modules.map((m) => (
            <Checkbox key={m.id} isChecked={selectedModules.includes(m.id)} onChange={() => toggleModule(m.id)} colorScheme="blue">{m.title}</Checkbox>
          ))}
        </Stack>
      </Box>
      <Button colorScheme="blue" isDisabled={selectedModules.length === 0 || loading} onClick={startSession}>
        {loading ? "Cargando..." : "Iniciar sesion"}
      </Button>
    </Box>
  );
}

export default FlashcardsPage;
