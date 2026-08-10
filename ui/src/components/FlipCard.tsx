import { useState } from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { colors } from "../colors";

function FlipCard({ front, back, onKnow, onDontKnow }: { front: string; back: string; onKnow: () => void; onDontKnow: () => void }) {
  const [flipped, setFlipped] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped(!flipped);
    }
  };

  return (
    <Box maxW="500px" mx="auto" my={4} style={{ perspective: "1000px" }}>
      <Box
        position="relative"
        w="100%"
        minH="200px"
        cursor="pointer"
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Contenido de la tarjeta" : "Toca para voltear"}
        style={{ transformStyle: "preserve-3d", transition: "transform 0.5s", transform: flipped ? "rotateY(180deg)" : "none" }}
        onClick={() => setFlipped(!flipped)}
        onKeyDown={handleKeyDown}
        _focus={{ outline: "2px solid", outlineColor: colors.accent, outlineOffset: "2px" }}
      >
        <Box
          position="absolute"
          top={0} left={0} right={0} bottom={0}
          style={{ backfaceVisibility: "hidden" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg={colors.surface}
          border="1px solid"
          borderColor={colors.border}
          borderRadius="12px"
          p={6}
          textAlign="center"
        >
          <Text fontSize="1.2rem" fontWeight="600" color={colors.accent}>{front}</Text>
          <Text fontSize="xs" color={colors.textMuted} mt={3}>Toca para voltear</Text>
        </Box>
        <Box
          position="absolute"
          top={0} left={0} right={0} bottom={0}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg={colors.surface}
          border="1px solid"
          borderColor={colors.border}
          borderRadius="12px"
          p={6}
          textAlign="center"
        >
          <Text color={colors.textPrimary} fontSize="0.95rem" lineHeight="1.6">{back}</Text>
        </Box>
      </Box>
      {flipped && (
        <VStack mt={4} spacing={3}>
          <Button variant="outline" onClick={onDontKnow}>No sabia</Button>
          <Button colorScheme="blue" onClick={onKnow}>Sabia</Button>
        </VStack>
      )}
    </Box>
  );
}

export default FlipCard;
