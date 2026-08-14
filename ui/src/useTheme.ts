import { useSyncExternalStore } from "react";
import { getColors, getTheme, setTheme, subscribeTheme, initTheme } from "./colors";

initTheme();

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

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, colors, toggleTheme };
}
