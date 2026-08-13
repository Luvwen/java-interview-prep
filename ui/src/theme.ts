import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { colors } from "./colors";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: colors.bg,
        color: colors.textPrimary,
      },
      "*": {
        transition: "all 0.15s ease",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "blue",
      },
      baseStyle: {
        borderRadius: "10px",
        fontWeight: 500,
      },
    },
  },
});

export default theme;
