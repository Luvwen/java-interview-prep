import { useEffect, useState } from "react";
import "../monokai-prism.css";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { ArrowLeft, Check } from "lucide-react";
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

function SectionBlock({ section }: { section: TopicSection }) {
  return (
    <Box mb={4}>
      <Heading size="sm" color={colors.accent} mb={2}>{section.title}</Heading>
      {renderContent(section.text)}
      {section.code && <CodeBlock code={section.code} />}
    </Box>
  );
}

function ModulePage({ moduleId, onOpenQuiz, onBack }: { moduleId: string; onOpenQuiz: () => void; onBack: () => void }) {
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [state, setState] = useState<ModuleState>("PENDING");
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getModule(moduleId), api.getProgress()])
      .then(([detail, progress]) => {
        setModule(detail);
        setState(progress.moduleStates[moduleId] ?? "PENDING");
      })
      .catch((err: Error) => setError(err.message));
  }, [moduleId]);

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

  return (
    <Box>
      <Button variant="ghost" color={colors.accent} leftIcon={<ArrowLeft size={16} />} onClick={onBack} mb={4} size="sm">
        Volver
      </Button>
      <Flex align="center" gap={3} mb={2}>
        <Heading size="lg">{module.title}</Heading>
        <StateBadge state={state} />
      </Flex>
      <Text color={colors.textMuted} mb={6}>{module.description}</Text>

      <VStack align="stretch" spacing={5}>
        {module.topics.map((topic) => (
          <Box key={topic.id} bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5}>
            <Heading size="md" color={colors.accent} mb={3}>{topic.title}</Heading>
            {topic.sections && topic.sections.length > 0 ? (
              topic.sections.map((section, i) => (
                <SectionBlock key={i} section={section} />
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
