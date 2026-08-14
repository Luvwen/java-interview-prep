const darkColors = {
  bg: "#12161f",
  surface: "#1c2330",
  surfaceHover: "#242e3f",
  border: "#2c3748",
  borderSelected: "#4a6cf7",
  accent: "#6c8cff",
  textPrimary: "#e6e9ef",
  textMuted: "#9aa4b5",
  error: "#e5534b",
  success: "#37c38a",
  codeBg: "#2b2b2b",
  codeBorder: "#3c3f41",
  codeText: "#a9b7c6",
  shadow: "0 2px 8px rgba(0,0,0,0.25)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.35)",
  gradient: "linear-gradient(135deg, #1c2330 0%, #1a1f2e 100%)",
};

const lightColors = {
  bg: "#f5f6fa",
  surface: "#ffffff",
  surfaceHover: "#f0f1f5",
  border: "#d1d5db",
  borderSelected: "#4a6cf7",
  accent: "#4a6cf7",
  textPrimary: "#1a202c",
  textMuted: "#6b7280",
  error: "#dc2626",
  success: "#16a34a",
  codeBg: "#f8f9fa",
  codeBorder: "#e5e7eb",
  codeText: "#374151",
  shadow: "0 2px 8px rgba(0,0,0,0.08)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.12)",
  gradient: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
};

export type ThemeColors = typeof darkColors;

let currentColors: ThemeColors = darkColors;
let listeners: Array<() => void> = [];

export function getColors(): ThemeColors {
  return currentColors;
}

export function getTheme(): "dark" | "light" {
  return currentColors === darkColors ? "dark" : "light";
}

export function setTheme(theme: "dark" | "light") {
  currentColors = theme === "dark" ? darkColors : lightColors;
  localStorage.setItem("javatheory_theme", theme);
  listeners.forEach((l) => l());
}

export function initTheme() {
  const saved = localStorage.getItem("javatheory_theme") as "dark" | "light" | null;
  if (saved) {
    currentColors = saved === "light" ? lightColors : darkColors;
  }
}

export function subscribeTheme(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export const colors = darkColors;
