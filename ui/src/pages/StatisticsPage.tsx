import { useEffect, useState } from "react";
import {
  Box, Button, Flex, Heading, Progress, Text, VStack, Badge, SimpleGrid,
} from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "../api";
import { colors } from "../colors";
import type { Attempt } from "../types";
import { SkeletonStats } from "../components/Skeletons";

interface ModuleStats { moduleId: string; title: string; correct: number; wrong: number; bestPercent: number; avgPercent: number; avgTimeSeconds: number; attempts: number; }

function StatisticsPage({ onOpenModule }: { onOpenModule: (id: string) => void }) {
  const [stats, setStats] = useState<Record<string, ModuleStats> | null>(null);
  const [streak, setStreak] = useState<{ current: number; lastDate: string | null } | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStats(), api.getStreak(), api.getProgress()])
      .then(([statsData, streakData, progress]) => { setStats(statsData); setStreak(streakData); setAttempts(progress.attempts ?? []); })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <Text color={colors.error}>{error}</Text>;
  if (!stats) return <SkeletonStats />;

  const entries = Object.values(stats);
  const totalCorrect = entries.reduce((s, e) => s + e.correct, 0);
  const totalWrong = entries.reduce((s, e) => s + e.wrong, 0);
  const totalAttempts = entries.reduce((s, e) => s + e.attempts, 0);
  const totalAnswered = totalCorrect + totalWrong;
  const globalPercent = totalAnswered > 0 ? Math.round((totalCorrect * 100) / totalAnswered) : 0;

  const barData = entries
    .filter((e) => e.correct + e.wrong > 0)
    .map((e) => ({
      name: e.title.length > 12 ? e.title.substring(0, 12) + "..." : e.title,
      correctas: e.correct,
      incorrectas: e.wrong,
    }));

  const pieData = [
    { name: "Correctas", value: totalCorrect },
    { name: "Incorrectas", value: totalWrong },
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>Estadisticas</Heading>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        {[
          { value: totalAttempts, label: "Intentos totales" },
          { value: totalCorrect, label: "Correctas" },
          { value: totalWrong, label: "Incorrectas" },
          { value: streak?.current ?? 0, label: "Racha (dias)" },
        ].map((stat) => (
          <Box key={stat.label} bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="10px" p={4} textAlign="center">
            <Text fontSize="1.6rem" fontWeight="700" color={colors.accent}>{stat.value}</Text>
            <Text fontSize="sm" color={colors.textMuted}>{stat.label}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {barData.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5}>
            <Heading size="sm" mb={4}>Aciertos vs Errores por Modulo</Heading>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="name" tick={{ fill: colors.textMuted, fontSize: 11 }} />
                <YAxis tick={{ fill: colors.textMuted, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "8px" }}
                  labelStyle={{ color: colors.textPrimary }}
                />
                <Bar dataKey="correctas" fill={colors.success} radius={[4, 4, 0, 0]} />
                <Bar dataKey="incorrectas" fill={colors.error} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5} display="flex" flexDirection="column" alignItems="center">
            <Heading size="sm" mb={4}>Precision Global</Heading>
            <Box position="relative" width="200px" height="200px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill={colors.success} />
                    <Cell fill={colors.error} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
                <Text fontSize="2xl" fontWeight="700" color={colors.textPrimary}>{globalPercent}%</Text>
                <Text fontSize="xs" color={colors.textMuted}>correctas</Text>
              </Box>
            </Box>
            <Text fontSize="sm" color={colors.textMuted} mt={3}>{totalCorrect} de {totalAnswered} respuestas</Text>
          </Box>
        </SimpleGrid>
      )}

      <Heading size="md" mb={4}>Por modulo</Heading>
      <VStack align="stretch" spacing={3} mb={8}>
        {entries.map((stat) => {
          const total = stat.correct + stat.wrong;
          const percent = total > 0 ? Math.round((stat.correct * 100) / total) : 0;
          const weak = percent < 60 && total > 0;
          return (
            <Box key={stat.moduleId} bg={colors.surface} border="1px solid" borderColor={weak ? colors.error : colors.border} borderRadius="10px" p={4}>
              <Flex align="center" gap={2} mb={2}>
                <Button variant="link" color={colors.accent} size="sm" onClick={() => onOpenModule(stat.moduleId)}>{stat.title}</Button>
                {weak && <Badge colorScheme="red" fontSize="xs">Debil</Badge>}
                <Text ml="auto" fontSize="xs" color={colors.textMuted}>{stat.attempts} intentos</Text>
              </Flex>
              <Flex align="center" gap={3}>
                <Progress value={percent} size="sm" colorScheme="green" borderRadius="full" flex={1} bg={colors.surfaceHover} />
                <Text fontSize="sm" color={colors.textMuted} minW="36px" textAlign="right">{percent}%</Text>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      {attempts.length > 0 && (
        <>
          <Heading size="md" mb={4}>Intentos recientes</Heading>
          <VStack align="stretch" spacing={2}>
            {attempts.slice(-10).reverse().map((attempt, i) => (
              <Flex key={i} align="center" gap={3} bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="8px" px={4} py={3}>
                <Badge colorScheme={attempt.passed ? "green" : "red"} textTransform="uppercase" fontSize="xs">{attempt.mode}</Badge>
                <Text>{attempt.score}/{attempt.total}</Text>
                <Text ml="auto" fontSize="sm" color={colors.textMuted}>{attempt.date}</Text>
              </Flex>
            ))}
          </VStack>
        </>
      )}
    </Box>
  );
}

export default StatisticsPage;
