import { useSyncExternalStore } from "react";
import { getColors, getTheme, setTheme, subscribeTheme, initTheme, type ThemeName } from "./colors";

initTheme();

const THEME_ORDER: ThemeName[] = ["dark", "light", "purple", "rose", "neutral"];

const THEME_LABELS: Record<ThemeName, string> = {
  dark: "Oscuro",
  light: "Claro",
  purple: "Violeta",
  rose: "Rosado",
  neutral: "Neutro",
};

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getTheme,
    () => getTheme()
  );
  const colors = useSyncExternalStore(
    subscribeTheme,
    getColors,
    () => getColors()
  );

  const cycleTheme = () => {
    const idx = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    setTheme(next);
  };

  const setSpecificTheme = (t: ThemeName) => setTheme(t);

  return {
    theme,
    colors,
    cycleTheme,
    setTheme: setSpecificTheme,
    themeLabel: THEME_LABELS[theme],
    allThemes: THEME_ORDER.map(t => ({ id: t, label: THEME_LABELS[t] })),
  };
}
