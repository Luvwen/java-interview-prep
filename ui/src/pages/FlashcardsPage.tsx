import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Checkbox, Flex, Heading, Stack, Text, HStack, Badge,
} from "@chakra-ui/react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { ModuleSummary, ModuleDetail } from "../types";
import FlipCard from "../components/FlipCard";

interface Flashcard {
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  title: string;
  content: string;
}

interface CardStats {
  known: number;
  unknown: number;
  lastSeen: string;
}

const STORAGE_KEY = "javatheory_flashcards";

function loadStats(): Record<string, CardStats> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveStats(stats: Record<string, CardStats>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function FlashcardsPage({ onExit }: { onExit: () => void }) {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [totalPasses, setTotalPasses] = useState(0);

  useEffect(() => { api.listModules().then(setModules).catch((err: Error) => setError(err.message)); }, []);

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startSession = async () => {
    if (selectedModules.length === 0) return;
    setLoading(true); setError(null);
    try {
      const allCards: Flashcard[] = [];
      for (const moduleId of selectedModules) {
        const detail: ModuleDetail = await api.getModule(moduleId);
        const mod = modules.find((m) => m.id === moduleId);
        for (const topic of detail.topics) {
          allCards.push({
            moduleId,
            moduleTitle: mod?.title ?? moduleId,
            topicId: topic.id,
            title: topic.title,
            content: topic.content.substring(0, 300) + (topic.content.length > 300 ? "..." : ""),
          });
        }
      }
      setDeck(shuffle(allCards));
      setCurrentIndex(0);
      setKnownIds(new Set());
      setUnknownIds(new Set());
      setRetryCount({});
      setSessionDone(false);
      setTotalPasses(0);
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  };

  const persistStats = useCallback((known: Set<string>, unknown: Set<string>) => {
    const stats = loadStats();
    const today = new Date().toISOString().split("T")[0];
    for (const id of known) {
      const prev = stats[id] || { known: 0, unknown: 0, lastSeen: "" };
      stats[id] = { known: prev.known + 1, unknown: prev.unknown, lastSeen: today };
    }
    for (const id of unknown) {
      if (!known.has(id)) {
        const prev = stats[id] || { known: 0, unknown: 0, lastSeen: "" };
        stats[id] = { known: prev.known, unknown: prev.unknown + 1, lastSeen: today };
      }
    }
    saveStats(stats);
  }, []);

  const advance = useCallback(() => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionDone(true);
      persistStats(knownIds, unknownIds);
    }
  }, [currentIndex, deck.length, knownIds, unknownIds, persistStats]);

  const markKnown = () => {
    const card = deck[currentIndex];
    setKnownIds((prev) => new Set(prev).add(card.topicId));
    advance();
  };

  const markUnknown = () => {
    const card = deck[currentIndex];
    const key = `${card.moduleId}-${card.topicId}`;
    setUnknownIds((prev) => new Set(prev).add(card.topicId));
    setRetryCount((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    advance();
  };

  const retryUnknown = () => {
    const unknownCards = deck.filter((c) => unknownIds.has(c.topicId));
    if (unknownCards.length === 0) { setSessionDone(true); return; }

    const shuffled = shuffle(unknownCards);
    setDeck(shuffled);
    setCurrentIndex(0);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setSessionDone(false);
    setTotalPasses((p) => p + 1);
  };

  const toggleModule = (id: string) => setSelectedModules((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  if (error) return <Text color={colors.error}>{error}</Text>;

  if (sessionDone) {
    return (
      <Box textAlign="center">
        <Heading size="lg" mb={4}>Sesion de Flashcards</Heading>
        <HStack justify="center" spacing={6} mb={4}>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="700" color={colors.success}>{knownIds.size}</Text>
            <Text fontSize="sm" color={colors.textMuted}>Sabia</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="700" color={colors.error}>{unknownIds.size}</Text>
            <Text fontSize="sm" color={colors.textMuted}>No sabia</Text>
          </Box>
          {totalPasses > 0 && (
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="700" color={colors.accent}>{totalPasses}</Text>
              <Text fontSize="sm" color={colors.textMuted}>Repeticiones</Text>
            </Box>
          )}
        </HStack>
        {unknownIds.size > 0 ? (
          <>
            <Text color={colors.textMuted} mb={4}>Quedan {unknownIds.size} tarjetas por reforzar.</Text>
            <HStack justify="center" spacing={3}>
              <Button colorScheme="blue" leftIcon={<RotateCcw size={16} />} onClick={retryUnknown}>
                Repetir las que no sabia
              </Button>
              <Button variant="outline" onClick={onExit}>Volver</Button>
            </HStack>
          </>
        ) : (
          <>
            <Text color={colors.success} mb={4}>Dominaste todas las tarjetas de esta sesion.</Text>
            <HStack justify="center" spacing={3}>
              <Button colorScheme="blue" onClick={startSession}>Nueva sesion</Button>
              <Button variant="outline" onClick={onExit}>Volver</Button>
            </HStack>
          </>
        )}
      </Box>
    );
  }

  if (deck.length > 0) {
    const card = deck[currentIndex];
    const cardKey = `${card.moduleId}-${card.topicId}`;
    const retries = retryCount[cardKey] || 0;
    return (
      <Box textAlign="center">
        <HStack justify="center" spacing={3} mb={2}>
          <Text color={colors.textMuted}>{currentIndex + 1} / {deck.length}</Text>
          {retries > 0 && (
            <Badge colorScheme="orange" fontSize="xs">Repeticion {retries}</Badge>
          )}
        </HStack>
        <Text color={colors.textMuted} mb={4}>{card.moduleTitle}</Text>
        <FlipCard front={card.title} back={card.content} onKnow={markKnown} onDontKnow={markUnknown} />
      </Box>
    );
  }

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onExit} mb={4} size="sm">Volver</Button>
      <Heading size="lg" mb={2}>Flashcards</Heading>
      <Text color={colors.textMuted} mb={6}>
        Voltea las tarjetas y autoevalua si sabias el contenido. Las tarjetas que marques como "no sabia" volveran a aparecer para reforzar.
      </Text>
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
