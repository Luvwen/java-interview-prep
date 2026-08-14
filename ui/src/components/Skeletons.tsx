import { Box, SimpleGrid, Skeleton, SkeletonText, Stack } from "@chakra-ui/react";
import { colors } from "../colors";

export function SkeletonCard({ count = 1, columns = { base: 1, md: 2, lg: 3 } }: { count?: number; columns?: Record<string, number> }) {
  return (
    <SimpleGrid columns={columns} spacing={5}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          bg={colors.surface}
          border="1px solid"
          borderColor={colors.border}
          borderRadius="16px"
          p={5}
        >
          <Skeleton height="20px" width="60%" mb={3} />
          <SkeletonText mt={2} noOfLines={2} spacing={3} />
        </Box>
      ))}
    </SimpleGrid>
  );
}

export function SkeletonModuleContent() {
  return (
    <Stack spacing={6}>
      <Skeleton height="28px" width="40%" />
      <SkeletonText noOfLines={1} spacing={3} width="70%" />
      <Box
        bg={colors.surface}
        border="1px solid"
        borderColor={colors.border}
        borderRadius="16px"
        p={5}
      >
        <Skeleton height="18px" width="30%" mb={4} />
        <SkeletonText noOfLines={5} spacing={3} />
      </Box>
      <Box
        bg={colors.surface}
        border="1px solid"
        borderColor={colors.border}
        borderRadius="16px"
        p={5}
      >
        <Skeleton height="18px" width="25%" mb={4} />
        <SkeletonText noOfLines={4} spacing={3} />
      </Box>
    </Stack>
  );
}

export function SkeletonQuiz() {
  return (
    <Stack spacing={4}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          bg={colors.surface}
          border="1px solid"
          borderColor={colors.border}
          borderRadius="12px"
          p={5}
        >
          <Skeleton height="16px" width="80%" mb={3} />
          <Stack spacing={2}>
            <Skeleton height="36px" />
            <Skeleton height="36px" />
            <Skeleton height="36px" />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export function SkeletonStats() {
  return (
    <Stack spacing={4}>
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={4} flex={1}>
            <Skeleton height="28px" width="50%" mb={2} />
            <Skeleton height="14px" width="70%" />
          </Box>
        ))}
      </Stack>
      <Box bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" p={5}>
        <SkeletonText noOfLines={6} spacing={3} />
      </Box>
    </Stack>
  );
}
