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
  bg: "#f8f9fc",
  surface: "#ffffff",
  surfaceHover: "#f1f3f9",
  border: "#dfe3ec",
  borderSelected: "#4a6cf7",
  accent: "#4a6cf7",
  textPrimary: "#1b2559",
  textMuted: "#68769f",
  error: "#e31a1a",
  success: "#05c168",
  codeBg: "#f4f5f8",
  codeBorder: "#e3e6ee",
  codeText: "#364163",
  shadow: "0 2px 8px rgba(103,119,163,0.08)",
  shadowLg: "0 8px 24px rgba(103,119,163,0.12)",
  gradient: "linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)",
};

const purpleColors = {
  bg: "#1a1625",
  surface: "#231e30",
  surfaceHover: "#2d2740",
  border: "#3a3350",
  borderSelected: "#bd99eb",
  accent: "#e7a8ff",
  textPrimary: "#ede8f5",
  textMuted: "#a098b8",
  error: "#ff6b8a",
  success: "#7dd3a0",
  codeBg: "#1e1a2a",
  codeBorder: "#3e3755",
  codeText: "#d4c8ef",
  shadow: "0 2px 8px rgba(80,50,120,0.3)",
  shadowLg: "0 8px 24px rgba(80,50,120,0.4)",
  gradient: "linear-gradient(135deg, #231e30 0%, #1e1a2a 100%)",
};

const roseColors = {
  bg: "#1f1520",
  surface: "#2a1c2c",
  surfaceHover: "#362538",
  border: "#453048",
  borderSelected: "#d984a3",
  accent: "#f3acc6",
  textPrimary: "#f5e8ef",
  textMuted: "#b898a8",
  error: "#ff6b8a",
  success: "#7dd3a0",
  codeBg: "#221825",
  codeBorder: "#4a3550",
  codeText: "#e0c8d8",
  shadow: "0 2px 8px rgba(100,40,70,0.3)",
  shadowLg: "0 8px 24px rgba(100,40,70,0.4)",
  gradient: "linear-gradient(135deg, #2a1c2c 0%, #221825 100%)",
};

const neutralColors = {
  bg: "#1a1c1b",
  surface: "#222523",
  surfaceHover: "#2c2f2d",
  border: "#3a3d3b",
  borderSelected: "#c2cfc7",
  accent: "#c2cfc7",
  textPrimary: "#edeae6",
  textMuted: "#9a9792",
  error: "#e07060",
  success: "#80c8a0",
  codeBg: "#1d201e",
  codeBorder: "#404341",
  codeText: "#c8c5c0",
  shadow: "0 2px 8px rgba(0,0,0,0.25)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.35)",
  gradient: "linear-gradient(135deg, #222523 0%, #1d201e 100%)",
};

export type ThemeColors = typeof darkColors;
export type ThemeName = "dark" | "light" | "purple" | "rose" | "neutral";

const themeMap: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
  purple: purpleColors,
  rose: roseColors,
  neutral: neutralColors,
};

let currentColors: ThemeColors = darkColors;
let currentTheme: ThemeName = "dark";
let listeners: Array<() => void> = [];

export function getColors(): ThemeColors {
  return currentColors;
}

export function getTheme(): ThemeName {
  return currentTheme;
}

export function setTheme(theme: ThemeName) {
  currentTheme = theme;
  currentColors = themeMap[theme];
  localStorage.setItem("javatheory_theme", theme);
  listeners.forEach((l) => l());
}

export function initTheme() {
  const saved = localStorage.getItem("javatheory_theme") as ThemeName | null;
  if (saved && themeMap[saved]) {
    currentTheme = saved;
    currentColors = themeMap[saved];
  }
}

export function subscribeTheme(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export const colors = darkColors;
