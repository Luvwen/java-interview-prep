import { useEffect, useState } from "react";
import "../monokai-prism.css";
import {
  Box,
  Button,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, List } from "lucide-react";
import { api } from "../api";
import { colors } from "../colors";
import type { ModuleDetail, ModuleState, TopicSection } from "../types";
import StateBadge from "../components/StateBadge";
import CodeBlock from "../components/CodeBlock";

function renderContent(text: string) {
  const paragraphs = text.split("\n\n");
  return paragraphs.map((p, i) => {
    const html = p
      .replace(/^(Conceptos avanzados:.*)$/gm, `<strong style="color:${colors.accent}">$1</strong>`)
      .replace(/^(Errores comunes en entrevistas:.*)$/gm, `<strong style="color:${colors.accent}">$1</strong>`)
      .replace(/^(Comparaciones:.*)$/gm, `<strong style="color:${colors.accent}">$1</strong>`)
      .replace(/\n/g, "<br/>");
    return (
      <Text key={i} mb={3} lineHeight="1.7" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

function SectionBlock({ section, id }: { section: TopicSection; id?: string }) {
  return (
    <Box mb={4} id={id}>
      <Heading size="sm" color={colors.accent} mb={2}>{section.title}</Heading>
      {renderContent(section.text)}
      {section.code && <CodeBlock code={section.code} />}
    </Box>
  );
}

interface TOCTopic {
  id: string;
  title: string;
  sections?: { title: string; id: string }[];
}

function TOCItem({
  t,
  isActive,
  isExpanded,
  activeSectionId,
  onToggle,
  onScroll,
  onScrollSection,
}: {
  t: TOCTopic;
  isActive: boolean;
  isExpanded: boolean;
  activeSectionId: string | null;
  onToggle: () => void;
  onScroll: (id: string) => void;
  onScrollSection: (id: string) => void;
}) {
  const hasSections = t.sections && t.sections.length > 0;

  return (
    <Box>
      <HStack
        as="button"
        w="100%"
        textAlign="left"
        px={3}
        py={2}
        borderRadius="8px"
        fontSize="sm"
        fontWeight={isActive ? 600 : 500}
        color={isActive ? colors.accent : "#8b95a8"}
        bg={isActive ? "rgba(108,140,255,0.12)" : "transparent"}
        transition="all 0.15s"
        _hover={{ bg: "rgba(108,140,255,0.08)", color: colors.textPrimary }}
        spacing={2}
        onClick={() => {
          if (hasSections) onToggle();
          onScroll(`topic-${t.id}`);
        }}
      >
        {hasSections && (
          <Icon
            as={isExpanded ? ChevronUp : ChevronDown}
            boxSize={3}
            color="inherit"
            transition="transform 0.2s"
          />
        )}
        <Text flex={1}>{t.title}</Text>
      </HStack>
      {hasSections && (
        <Collapse in={isExpanded} animateOpacity>
          <VStack align="stretch" spacing={0} pl={6} mt={1}>
            {t.sections!.map((s) => (
              <Box
                key={s.id}
                as="button"
                w="100%"
                textAlign="left"
                px={3}
                py={1.5}
                borderRadius="6px"
                fontSize="xs"
                fontWeight={activeSectionId === s.id ? 600 : 400}
                color={activeSectionId === s.id ? "#a3b5f0" : "#6b7280"}
                bg={activeSectionId === s.id ? "rgba(108,140,255,0.08)" : "transparent"}
                transition="all 0.15s"
                _hover={{ color: colors.textPrimary, bg: "rgba(108,140,255,0.05)" }}
                onClick={() => onScrollSection(s.id)}
              >
                {s.title}
              </Box>
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );
}

function ModuleTOC({
  topics,
  activeTopicId,
  activeSectionId,
}: {
  topics: TOCTopic[];
  activeTopicId: string | null;
  activeSectionId: string | null;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeTopicId) {
      setExpanded((prev) => {
        if (prev.has(activeTopicId)) return prev;
        const next = new Set(prev);
        next.add(activeTopicId);
        return next;
      });
    }
  }, [activeTopicId]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToSection = (id: string) => {
    scrollTo(id);
    onClose();
  };

  const toggleExpand = (topicId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const tocList = (
    <VStack align="stretch" spacing={1}>
      {topics.map((t) => (
        <TOCItem
          key={t.id}
          t={t}
          isActive={activeTopicId === t.id}
          isExpanded={expanded.has(t.id)}
          activeSectionId={activeSectionId}
          onToggle={() => toggleExpand(t.id)}
          onScroll={scrollTo}
          onScrollSection={scrollToSection}
        />
      ))}
    </VStack>
  );

  return (
    <>
      <Box
        display={{ base: "none", md: "block" } as never}
        position="sticky"
        top="80px"
        alignSelf="flex-start"
        bg={colors.gradient}
        border="1px solid"
        borderColor={colors.border}
        borderRadius="16px"
        p={4}
        maxH="calc(100vh - 120px)"
        overflowY="auto"
        minW="260px"
        maxW="260px"
        boxShadow={colors.shadow}
      >
        <Text fontSize="xs" color="#6b7280" textTransform="uppercase" letterSpacing="1px" fontWeight={700} mb={3}>
          Contenidos
        </Text>
        {tocList}
      </Box>

      <Button
        display={{ base: "flex", md: "none" } as never}
        position="fixed"
        bottom={6}
        right={6}
        zIndex={20}
        w={14}
        h={14}
        borderRadius="full"
        bg={colors.accent}
        color="white"
        _hover={{ bg: "#5a7aee", transform: "scale(1.05)" }}
        _active={{ transform: "scale(0.95)" }}
        boxShadow="0 4px 16px rgba(108,140,255,0.4)"
        onClick={onOpen}
        p={0}
      >
        <Icon as={List} boxSize={6} />
      </Button>

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent bg={colors.bg} borderTopRadius="20px">
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={colors.border}>
            <HStack spacing={2}>
              <Icon as={List} color={colors.accent} boxSize={5} />
              <Text fontWeight={600} color={colors.textPrimary}>Indice del modulo</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody py={4}>
            {tocList}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ModulePage({ moduleId, onOpenQuiz, onBack }: { moduleId: string; onOpenQuiz: () => void; onBack: () => void }) {
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [state, setState] = useState<ModuleState>("PENDING");
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getModule(moduleId), api.getProgress()])
      .then(([detail, progress]) => {
        setModule(detail);
        setState(progress.moduleStates[moduleId] ?? "PENDING");
      })
      .catch((err: Error) => setError(err.message));
  }, [moduleId]);

  useEffect(() => {
    if (!module) return;

    const idsToObserve: string[] = [];
    module.topics.forEach((t) => {
      idsToObserve.push(`topic-${t.id}`);
      if (t.sections) {
        t.sections.forEach((_, i) => {
          idsToObserve.push(`section-${t.id}-${i}`);
        });
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id.startsWith("section-")) {
              const parts = id.replace("section-", "").split("-");
              const topicId = parts.slice(0, -1).join("-");
              setActiveTopicId(topicId);
              setActiveSectionId(id);
            } else if (id.startsWith("topic-")) {
              setActiveTopicId(id.replace("topic-", ""));
              setActiveSectionId(null);
            }
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    idsToObserve.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [module]);

  if (error) return <Text color={colors.error}>{error}</Text>;
  if (!module) return <Spinner size="lg" color={colors.accent} display="block" mx="auto" mt={12} />;

  const markCompleted = async () => {
    setCompleting(true);
    try {
      await api.completeModule(moduleId);
      setState("COMPLETED");
      setMessage("Modulo marcado como completado.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCompleting(false);
    }
  };

  const tocTopics: TOCTopic[] = module.topics.map((t) => ({
    id: t.id,
    title: t.title,
    sections: t.sections?.map((s, i) => ({
      title: s.title,
      id: `section-${t.id}-${i}`,
    })),
  }));

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onBack} mb={4} size="sm">
        Volver
      </Button>
      <Flex align="center" gap={3} mb={2}>
        <Heading size="lg">{module.title}</Heading>
        <StateBadge state={state} />
      </Flex>
      <Text color={colors.textMuted} mb={4}>{module.description}</Text>

      <Flex align="flex-start" gap={10} ml={{ md: -2 }}>
        <ModuleTOC topics={tocTopics} activeTopicId={activeTopicId} activeSectionId={activeSectionId} />

        <VStack align="stretch" spacing={5} flex={1} minW={0}>
          {module.topics.map((topic) => (
            <Box key={topic.id} id={`topic-${topic.id}`} bg={colors.gradient} border="1px solid" borderColor={colors.border} borderRadius="16px" p={{ base: 4, md: 5 }} boxShadow={colors.shadow}>
              <Heading size="md" color={colors.accent} mb={3}>{topic.title}</Heading>
              {topic.sections && topic.sections.length > 0 ? (
                topic.sections.map((section, i) => (
                  <SectionBlock key={i} section={section} id={`section-${topic.id}-${i}`} />
                ))
              ) : (
                <>
                  {renderContent(topic.content)}
                  {topic.examples.length > 0 && (
                    <Box mt={4}>
                      <Text fontSize="sm" color={colors.textMuted} textTransform="uppercase" letterSpacing="0.5px" mb={2} fontWeight={600}>
                        Ejemplos
                      </Text>
                      {topic.examples.map((ex, i) => (
                        <CodeBlock key={i} code={ex} />
                      ))}
                    </Box>
                  )}
                </>
              )}
            </Box>
          ))}
        </VStack>
      </Flex>

      <HStack mt={6} spacing={3}>
        <Button colorScheme="blue" onClick={onOpenQuiz}>Ir al quiz</Button>
        <Button
          variant="outline"
          leftIcon={<Check size={16} />}
          isDisabled={state === "COMPLETED" || completing}
          onClick={markCompleted}
        >
          {state === "COMPLETED" ? "Completado" : completing ? "Marcando..." : "Marcar como completado"}
        </Button>
      </HStack>
      {message && <Text color={colors.success} mt={3}>{message}</Text>}
    </Box>
  );
}

export default ModulePage;
