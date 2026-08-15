import {
  Box, HStack, VStack, Text, Heading, Button, Popover, PopoverTrigger,
  PopoverContent, PopoverBody, Tooltip,
} from "@chakra-ui/react";
import { Palette } from "lucide-react";
import { COLOR_PALETTES } from "../palettes";
import { colors } from "../colors";

interface PaletteSelectorProps {
  cycleTheme: () => void;
  themeLabel: string;
}

export default function PaletteSelector({ cycleTheme, themeLabel }: PaletteSelectorProps) {
  return (
    <Popover placement="bottom-end" trigger="hover">
      <PopoverTrigger>
        <Tooltip label="Cambiar tema">
          <Button
            size="sm"
            variant="ghost"
            color={colors.textMuted}
            leftIcon={<Palette size={16} />}
            onClick={cycleTheme}
            _hover={{ bg: colors.surfaceHover }}
          >
            {themeLabel}
          </Button>
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent bg={colors.surface} border="1px solid" borderColor={colors.border} borderRadius="12px" boxShadow={colors.shadowLg} w="320px">
        <PopoverBody p={4}>
          <VStack align="stretch" spacing={4}>
            <Heading size="xs" color={colors.textMuted} textTransform="uppercase" letterSpacing="wider">
              Paletas de Colores
            </Heading>
            {COLOR_PALETTES.map((palette) => (
              <Box key={palette.id}>
                <Text fontSize="xs" fontWeight="600" color={colors.textPrimary} mb={2}>
                  {palette.name}
                </Text>
                <HStack spacing={1}>
                  {palette.colors.map((color) => (
                    <Tooltip key={color.hex} label={`${color.name}\n${color.hex}`} placement="bottom">
                      <Box
                        w="40px"
                        h="32px"
                        borderRadius="6px"
                        bg={color.hex}
                        border="1px solid"
                        borderColor="rgba(0,0,0,0.1)"
                        cursor="pointer"
                        transition="transform 0.15s"
                        _hover={{ transform: "scale(1.15)" }}
                      />
                    </Tooltip>
                  ))}
                </HStack>
              </Box>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
