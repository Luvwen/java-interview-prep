import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Heading,
  HStack,
  VStack,
  Button,
  SimpleGrid,
  Text,
  Icon,
  IconButton,
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
  Code2,
  Bug,
  Briefcase,
  Menu,
  Coffee,
  Palette,
  Beaker,
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
import CodeFillPage from "./pages/CodeFillPage";
import BugHuntPage from "./pages/BugHuntPage";
import RealWorldPage from "./pages/RealWorldPage";
import LaboratorioPage from "./pages/LaboratorioPage";
import { useNavigation, type NavState } from "./useNavigation";
import { useTheme } from "./useTheme";

const activities = [
  { id: "time-attack" as const, title: "Contra Reloj", desc: "Responde contra un cronometro por pregunta.", icon: Clock },
  { id: "mixed-quiz" as const, title: "Quiz Mixto", desc: "Selecciona modulos y cantidad. Mezcla de formatos.", icon: Shuffle },
  { id: "error-review" as const, title: "Repasar Errores", desc: "Repasa las preguntas que fallaste.", icon: AlertTriangle },
  { id: "flashcards" as const, title: "Flashcards", desc: "Voltea tarjetas con conceptos clave.", icon: Layers },
  { id: "exam" as const, title: "Examen Simulado", desc: "Simula una entrevista: tiempo limitado.", icon: FileText },
  { id: "code-fill" as const, title: "Rellenar Codigo", desc: "Completa blanks en fragmentos de codigo.", icon: Code2 },
  { id: "bug-hunt" as const, title: "Encontrar el Bug", desc: "Identifica errores en codigo Java.", icon: Bug },
  { id: "statistics" as const, title: "Estadisticas", desc: "Ve tu desempeno por modulo.", icon: Trophy },
];

const navItems = [
  { id: "catalog" as const, label: "Modulos", icon: BookOpen },
  { id: "activities" as const, label: "Actividades", icon: Gamepad2 },
  { id: "laboratorio" as const, label: "Laboratorio", icon: Beaker },
  { id: "real-world" as const, label: "Casos Reales", icon: Briefcase },
  { id: "progress" as const, label: "Progreso", icon: BarChart3 },
];

function App() {
  const { view, moduleId, navigate } = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors, cycleTheme, themeLabel } = useTheme();

  useEffect(() => {
    document.body.style.backgroundColor = colors.bg;
    document.body.style.color = colors.textPrimary;
  }, [colors]);

  const go = (state: NavState) => {
    navigate(state);
    setDrawerOpen(false);
  };

  const openModule = (id: string) => go({ view: "module", moduleId: id });
  const backToCatalog = () => go({ view: "catalog", moduleId: null });

  const isActivity =
    view === "activities" ||
    view === "mixed-quiz" ||
    view === "error-review" ||
    view === "time-attack" ||
    view === "flashcards" ||
    view === "exam" ||
    view === "code-fill" ||
    view === "bug-hunt" ||
    view === "statistics";

  const isActive = (id: string) => {
    if (id === "catalog") return view === "catalog";
    if (id === "activities") return isActivity;
    if (id === "laboratorio") return view === "laboratorio";
    if (id === "real-world") return view === "real-world";
    if (id === "progress") return view === "progress";
    return false;
  };

  return (
    <Box minH="100vh" bg={colors.bg}>
      <Container maxW="1040px" px={{ base: 3, md: 4 }} pb={12}>
        <Flex as="header" align="center" justify="space-between" py={4} borderBottom="1px solid" borderColor={colors.border} mb={8}>
          <HStack
            as="button"
            spacing={2}
            onClick={() => go({ view: "catalog", moduleId: null })}
            _hover={{ opacity: 0.8 }}
            transition="opacity 0.15s"
          >
            <Icon as={Coffee} color={colors.accent} boxSize={6} />
            <Heading size="md" color={colors.accent} letterSpacing="-0.02em">
              Java Prep
            </Heading>
          </HStack>

          <HStack gap={2} display={{ base: "none", md: "flex" } as never}>
            {navItems.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={isActive(item.id) ? "solid" : "ghost"}
                color={isActive(item.id) ? "white" : colors.textMuted}
                onClick={() => go({ view: item.id, moduleId: null })}
                leftIcon={<item.icon size={16} />}
              >
                {item.label}
              </Button>
            ))}
          </HStack>

          <HStack gap={2}>
            <Button
              size="sm"
              variant="ghost"
              color={colors.textMuted}
              onClick={cycleTheme}
              leftIcon={<Palette size={16} />}
            >
              {themeLabel}
            </Button>
            <IconButton
              aria-label="Menu"
              icon={<Menu size={20} />}
              display={{ base: "flex", md: "none" } as never}
              variant="ghost"
              color={colors.textMuted}
              onClick={() => setDrawerOpen(true)}
              size="sm"
            />
          </HStack>
        </Flex>

        <Drawer isOpen={drawerOpen} placement="right" onClose={() => setDrawerOpen(false)}>
          <DrawerOverlay />
          <DrawerContent bg={colors.surface}>
            <DrawerCloseButton color={colors.textMuted} />
            <DrawerHeader borderBottom="1px solid" borderColor={colors.border}>
              <HStack spacing={2}>
                <Icon as={Coffee} color={colors.accent} boxSize={5} />
                <Heading size="sm" color={colors.accent}>Java Prep</Heading>
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              <VStack align="stretch" spacing={2} mt={4}>
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={isActive(item.id) ? "solid" : "ghost"}
                    color={isActive(item.id) ? "white" : colors.textMuted}
                    justifyContent="flex-start"
                    leftIcon={<item.icon size={18} />}
                    onClick={() => go({ view: item.id, moduleId: null })}
                    borderRadius="10px"
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  color={colors.textMuted}
                  justifyContent="flex-start"
                  leftIcon={<Palette size={18} />}
                  onClick={cycleTheme}
                  borderRadius="10px"
                  mt={4}
                >
                  Tema: {themeLabel}
                </Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

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
              <Heading size="lg" mb={2} letterSpacing="-0.02em">Actividades</Heading>
              <Text color={colors.textMuted} mb={6}>Practica con modos de juego diferentes al quiz normal.</Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                {activities.map((act) => (
                  <Box
                    key={act.id}
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
          {view === "code-fill" && <CodeFillPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "bug-hunt" && <BugHuntPage onExit={() => go({ view: "activities", moduleId: null })} />}
          {view === "statistics" && <StatisticsPage onOpenModule={openModule} />}
          {view === "real-world" && <RealWorldPage onExit={() => go({ view: "catalog", moduleId: null })} />}
          {view === "laboratorio" && <LaboratorioPage onExit={() => go({ view: "catalog", moduleId: null })} />}
          {view === "progress" && <ProgressPage onOpenModule={openModule} />}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
