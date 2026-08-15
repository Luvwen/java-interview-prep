import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, HStack, VStack, Text, Slider, SliderTrack, SliderThumb,
  SliderFilledTrack, IconButton, Tooltip,
} from "@chakra-ui/react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "../monokai-prism.css";
import { createRunner, type JavaRunner, type RunEvent } from "../lib/javaRunner";
import type { LabExercise } from "../types";
import { colors } from "../colors";

interface LabRunnerProps {
  exercise: LabExercise;
}

export default function LabRunner({ exercise }: LabRunnerProps) {
  const runnerRef = useRef<JavaRunner | null>(null);
  const [output, setOutput] = useState("");
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);

  useEffect(() => {
    runnerRef.current = createRunner();
    const runner = runnerRef.current;

    runner.setOnEvent((e: RunEvent) => {
      if (e.type === "output" && e.text !== undefined) {
        setOutput(e.text);
      }
      if (e.type === "line" && e.line !== undefined) {
        setHighlightLine(e.line);
      }
      if (e.type === "done") {
        setIsRunning(false);
        setIsPaused(false);
        setHighlightLine(null);
      }
    });

    runner.reset();
    setOutput("");
    setHighlightLine(null);
    setIsRunning(false);
    setIsPaused(false);
  }, [exercise.id]);

  useEffect(() => {
    runnerRef.current?.setSpeed(speed);
  }, [speed]);

  const handleRun = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner) return;
    setIsRunning(true);
    setIsPaused(false);
    setOutput("");
    runner.setSpeed(speed);
    await runner.run(exercise.id);
  }, [exercise.id, speed]);

  const handlePause = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    if (isPaused) {
      runner.resume();
      setIsPaused(false);
    } else {
      runner.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  const handleReset = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    runner.stop();
    runner.reset();
    setOutput("");
    setHighlightLine(null);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const handleStep = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner) return;
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(true);
    }
    runner.stepOnce(exercise.id);
  }, [isRunning, exercise.id]);

  const lines = exercise.code.split("\n");

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold" fontSize="lg" color={colors.textPrimary}>{exercise.title}</Text>
        <Text color={colors.textMuted} fontSize="sm" mt={1}>{exercise.description}</Text>
      </Box>

      <HStack align="start" spacing={4} flexWrap="wrap">
        <Box flex={1} minW="300px">
          <Text fontSize="xs" fontWeight="bold" color={colors.textMuted} mb={1} textTransform="uppercase">
            Codigo
          </Text>
          <Box
            bg={colors.codeBg}
            borderRadius="8px"
            border="1px solid"
            borderColor={colors.codeBorder}
            overflow="auto"
            maxH="400px"
          >
            <Box display="flex" fontFamily="'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace" fontSize="0.82rem" lineHeight="1.6">
              <Box
                bg={colors.codeBg}
                color={colors.textMuted}
                px={2}
                py={3}
                textAlign="right"
                userSelect="none"
                minW="2.5rem"
                borderRight="1px solid"
                borderColor={colors.codeBorder}
                opacity={0.7}
              >
                {lines.map((_, i) => (
                  <Box
                    key={i}
                    h="1.6em"
                    bg={highlightLine === i + 1 ? `${colors.accent}22` : "transparent"}
                    color={highlightLine === i + 1 ? colors.textPrimary : undefined}
                    transition="background 0.15s"
                  >
                    {i + 1}
                  </Box>
                ))}
              </Box>
              <Box flex={1} minW={0} position="relative">
                {lines.map((line, i) => {
                  const grammar = Prism.languages["java"] ?? Prism.languages.markup;
                  const highlightedLine = Prism.highlight(line + "\n", grammar, "java");
                  return (
                    <Box
                      key={i}
                      px={3}
                      whiteSpace="pre"
                      bg={highlightLine === i + 1 ? `${colors.accent}15` : "transparent"}
                      borderLeft={highlightLine === i + 1 ? `3px solid ${colors.accent}` : "3px solid transparent"}
                      transition="background 0.15s, border-color 0.15s"
                      color={colors.codeText}
                      dangerouslySetInnerHTML={{ __html: highlightedLine }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box flex={1} minW="280px">
          <Text fontSize="xs" fontWeight="bold" color={colors.textMuted} mb={1} textTransform="uppercase">
            Consola
          </Text>
          <Box
            bg={colors.codeBg}
            borderRadius="8px"
            border="1px solid"
            borderColor={colors.codeBorder}
            p={3}
            minH="120px"
            maxH="400px"
            overflow="auto"
            fontFamily="'Cascadia Code', 'Fira Code', monospace"
            fontSize="0.82rem"
            lineHeight="1.6"
          >
            {output ? (
              output.split("\n").map((line, i) => (
                <Text key={i} color={line.startsWith(">") ? colors.accent : colors.success} whiteSpace="pre-wrap">
                  {line}
                </Text>
              ))
            ) : (
              <Text color={colors.textMuted} fontStyle="italic">
                Presiona Run para ejecutar...
              </Text>
            )}
          </Box>

          <HStack mt={3} spacing={2} flexWrap="wrap">
            <Tooltip label={isRunning && !isPaused ? "Pausar" : "Ejecutar"}>
              <Button
                size="sm"
                colorScheme={isRunning && !isPaused ? "yellow" : "green"}
                leftIcon={isRunning && !isPaused ? <Pause size={14} /> : <Play size={14} />}
                onClick={isRunning ? handlePause : handleRun}
              >
                {isRunning && !isPaused ? "Pausar" : isPaused ? "Reanudar" : "Run"}
              </Button>
            </Tooltip>
            <Tooltip label="Paso a paso">
              <IconButton
                size="sm"
                aria-label="Step"
                icon={<SkipForward size={14} />}
                onClick={handleStep}
                variant="outline"
                colorScheme="blue"
              />
            </Tooltip>
            <Tooltip label="Reiniciar">
              <IconButton
                size="sm"
                aria-label="Reset"
                icon={<RotateCcw size={14} />}
                onClick={handleReset}
                variant="outline"
              />
            </Tooltip>
          </HStack>

          <Box mt={3}>
            <Text fontSize="xs" color={colors.textMuted} mb={1}>
              Velocidad: {speed < 30 ? "Lenta" : speed < 70 ? "Normal" : "Rapida"}
            </Text>
            <Slider
              value={speed}
              onChange={setSpeed}
              min={10}
              max={100}
              step={10}
              size="sm"
            >
              <SliderTrack bg={colors.border}>
                <SliderFilledTrack bg={colors.accent} />
              </SliderTrack>
              <SliderThumb boxSize={3} />
            </Slider>
          </Box>
        </Box>
      </HStack>

      {exercise.theory && (
        <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="8px" p={4}>
          <Text fontSize="xs" fontWeight="bold" color={colors.accent} mb={1} textTransform="uppercase">
            Teoria
          </Text>
          <Text color={colors.textPrimary} fontSize="sm" whiteSpace="pre-wrap">
            {exercise.theory}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
