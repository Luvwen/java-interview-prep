import { useState } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { colors } from "../colors";

function OrderQuestion({ options, value, onChange }: { options: string[]; value: number[]; onChange: (order: number[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const items = value.map((idx) => ({ originalIndex: idx, text: options[idx] }));

  const moveUp = (pos: number) => {
    if (pos === 0) return;
    const next = [...value];
    [next[pos - 1], next[pos]] = [next[pos], next[pos - 1]];
    onChange(next);
  };

  const moveDown = (pos: number) => {
    if (pos >= value.length - 1) return;
    const next = [...value];
    [next[pos], next[pos + 1]] = [next[pos + 1], next[pos]];
    onChange(next);
  };

  const handleDragStart = (pos: number) => setDragIndex(pos);
  const handleDragOver = (e: React.DragEvent, pos: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === pos) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(pos, 0, moved);
    setDragIndex(pos);
    onChange(next);
  };
  const handleDragEnd = () => setDragIndex(null);

  return (
    <Box>
      {items.map((item, pos) => (
        <Flex
          key={`${item.originalIndex}-${pos}`}
          align="center"
          gap={3}
          bg={dragIndex === pos ? colors.surfaceHover : colors.surface}
          border="1px solid"
          borderColor={dragIndex === pos ? colors.accent : colors.border}
          borderRadius="8px"
          p={3}
          mb={2}
          cursor="grab"
          transition="all 0.15s"
          _hover={{ borderColor: colors.accent }}
          draggable
          onDragStart={() => handleDragStart(pos)}
          onDragOver={(e) => handleDragOver(e, pos)}
          onDragEnd={handleDragEnd}
        >
          <GripVertical size={16} color={colors.textMuted} />
          <Text flex={1} fontFamily="monospace" fontSize="0.9rem" whiteSpace="pre-wrap">{item.text}</Text>
          <Box display="flex" flexDirection="column" gap="2px">
            <IconButton aria-label="Move up" icon={<ChevronUp size={14} />} size="xs" variant="ghost" color={colors.textMuted} isDisabled={pos === 0} onClick={() => moveUp(pos)} />
            <IconButton aria-label="Move down" icon={<ChevronDown size={14} />} size="xs" variant="ghost" color={colors.textMuted} isDisabled={pos === value.length - 1} onClick={() => moveDown(pos)} />
          </Box>
        </Flex>
      ))}
    </Box>
  );
}

export default OrderQuestion;
