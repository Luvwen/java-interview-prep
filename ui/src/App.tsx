import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  SimpleGrid,
  Text,
  Icon,
} from "@chakra-ui/react";
import {
  BookOpen,
  Gamepad2,
  BarChart3,
  Clock,
  Shuffle,
  AlertTriangle,
  Layers,
  FileText,
  Trophy,
} from "lucide-react";
import CatalogPage from "./pages/CatalogPage";
import ModulePage from "./pages/ModulePage";
import ProgressPage from "./pages/ProgressPage";
import QuizPage from "./pages/QuizPage";
import MixedQuizPage from "./pages/MixedQuizPage";
import ErrorReviewPage from "./pages/ErrorReviewPage";
import TimeAttackPage from "./pages/TimeAttackPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import ExamPage from "./pages/ExamPage";
import StatisticsPage from "./pages/StatisticsPage";
import { useNavigation, type NavState } from "./useNavigation";
import { colors } from "./colors";

const activities = [
  { id: "time-attack" as const, title: "Contra Reloj", desc: "Responde contra un cronometro por pregunta. Pon a prueba tu velocidad.", icon: Clock },
  { id: "mixed-quiz" as const, title: "Quiz Mixto", desc: "Selecciona modulos y cantidad. Mezcla de formatos.", icon: Shuffle },
  { id: "error-review" as const, title: "Repasar Errores", desc: "Repasa las preguntas que fallaste. Acertar 2 veces seguidas las elimina.", icon: AlertTriangle },
  { id: "flashcards" as const, title: "Flashcards", desc: "Voltea tarjetas con conceptos clave y autoevalua si los sabias.", icon: Layers },
  { id: "exam" as const, title: "Examen Simulado", desc: "Simula una entrevista: tiempo limitado, sin ir atras.", icon: FileText },
  { id: "statistics" as const, title: "Estadisticas", desc: "Ve tu desempeno por modulo: aciertos, errores y topicos debiles.", icon: Trophy },
];

function App() {
  const { view, moduleId, navigate } = useNavigation();

  const go = (state: NavState) => navigate(state);

  const openModule = (id: string) => go({ view: "module", moduleId: id });
  const backToCatalog = () => go({ view: "catalog", moduleId: null });

  const isActivity =
    view === "activities" ||
    view === "mixed-quiz" ||
    view === "error-review" ||
    view === "time-attack" ||
    view === "flashcards" ||
    view === "exam" ||
    view === "statistics";

  return (
    <Box minH="100vh" bg={colors.bg}>
      <Container maxW="960px" px={4} pb={12}>
        <Flex as="header" align="center" justify="space-between" py={5} borderBottom="1px solid" borderColor={colors.border} mb={6}>
          <Heading size="md" color={colors.accent}>
            Java Theory
          </Heading>
          <HStack gap={2}>
            <Button
              size="sm"
              variant={view === "catalog" ? "solid" : "ghost"}
              color={view === "catalog" ? "white" : colors.textMuted}
              onClick={() => go({ view: "catalog", moduleId: null })}
              leftIcon={<BookOpen size={16} />}
            >
              Modulos
            </Button>
            <Button
              size="sm"
              variant={isActivity ? "solid" : "ghost"}
              color={isActivity ? "white" : colors.textMuted}
              onClick={() => go({ view: "activities", moduleId: null })}
              leftIcon={<Gamepad2 size={16} />}
            >
              Actividades
            </Button>
            <Button
              size="sm"
              variant={view === "progress" ? "solid" : "ghost"}
              color={view === "progress" ? "white" : colors.textMuted}
              onClick={() => go({ view: "progress", moduleId: null })}
              leftIcon={<BarChart3 size={16} />}
            >
              Progreso
            </Button>
          </HStack>
        </Flex>

        <Box as="main">
          {view === "catalog" && <CatalogPage onOpenModule={openModule} />}
          {view === "module" && moduleId && (
            <ModulePage moduleId={moduleId} onOpenQuiz={() => go({ view: "quiz", moduleId })} onBack={backToCatalog} />
          )}
          {view === "quiz" && moduleId && (
            <QuizPage moduleId={moduleId} onExit={backToCatalog} />
          )}
          {view === "activities" && (
            <Box>
              <Heading size="lg" mb={2}>Actividades</Heading>
              <Text color={colors.textMuted} mb={6}>Practica con modos de juego diferentes al quiz normal.</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {activities.map((act) => (
                  <Box
                    key={act.id}
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
                    onClick={() => go({ view: act.id, moduleId: null })}
                  >
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={act.icon} color={colors.accent} boxSize={5} />
                      <Heading size="sm" color={colors.textPrimary}>{act.title}</Heading>
                    </Flex>
                    <Text fontSize="sm" color={colors.textMuted}>{act.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
          {view === "time-attack" && <TimeAttackPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "mixed-quiz" && <MixedQuizPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "error-review" && <ErrorReviewPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "flashcards" && <FlashcardsPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "exam" && <ExamPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "statistics" && <StatisticsPage onOpenModule={openModule} />}
          {view === "progress" && <ProgressPage onOpenModule={openModule} />}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
