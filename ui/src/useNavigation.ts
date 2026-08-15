import { useCallback, useEffect, useRef, useState } from "react";

type View =
  | "catalog"
  | "module"
  | "quiz"
  | "progress"
  | "activities"
  | "mixed-quiz"
  | "error-review"
  | "time-attack"
  | "flashcards"
  | "exam"
  | "statistics"
  | "code-fill"
  | "bug-hunt"
  | "real-world"
  | "laboratorio";

interface NavState {
  view: View;
  moduleId: string | null;
}

function viewToPath(state: NavState): string {
  if (state.view === "module" && state.moduleId) return `/module/${state.moduleId}`;
  if (state.view === "quiz" && state.moduleId) return `/quiz/${state.moduleId}`;
  const map: Record<string, string> = {
    catalog: "/",
    progress: "/progress",
    activities: "/activities",
    "time-attack": "/activities/time-attack",
    "mixed-quiz": "/activities/mixed-quiz",
    "error-review": "/activities/error-review",
    flashcards: "/activities/flashcards",
    exam: "/activities/exam",
    statistics: "/statistics",
    "code-fill": "/activities/code-fill",
    "bug-hunt": "/activities/bug-hunt",
    laboratorio: "/laboratorio",
  };
  return map[state.view] ?? "/";
}

function parsePath(pathname: string): NavState {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "module" && parts[1]) return { view: "module", moduleId: parts[1] };
  if (parts[0] === "quiz" && parts[1]) return { view: "quiz", moduleId: parts[1] };
  if (parts[0] === "activities" && parts[1]) {
    const sub = parts[1];
    const subMap: Record<string, View> = {
      "time-attack": "time-attack",
      "mixed-quiz": "mixed-quiz",
      "error-review": "error-review",
      flashcards: "flashcards",
      exam: "exam",
      "code-fill": "code-fill",
      "bug-hunt": "bug-hunt",
    };
    if (subMap[sub]) return { view: subMap[sub], moduleId: null };
  }
  if (parts[0] === "real-world") return { view: "real-world", moduleId: null };
  if (parts[0] === "laboratorio") return { view: "laboratorio", moduleId: null };
  const viewMap: Record<string, View> = {
    progress: "progress",
    activities: "activities",
    statistics: "statistics",
  };
  if (parts[0] && viewMap[parts[0]]) return { view: viewMap[parts[0]], moduleId: null };
  return { view: "catalog", moduleId: null };
}

export function useNavigation() {
  const initial = useRef(parsePath(window.location.pathname));
  const [view, setView] = useState<View>(initial.current.view);
  const [moduleId, setModuleId] = useState<string | null>(initial.current.moduleId);

  const navigate = useCallback((next: NavState, push = true) => {
    setView(next.view);
    setModuleId(next.moduleId);
    if (push) {
      window.history.pushState(next, "", viewToPath(next));
    }
  }, []);

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      const state = e.state as NavState | null;
      if (state && state.view) {
        navigate(state, false);
      } else {
        const parsed = parsePath(window.location.pathname);
        navigate(parsed, false);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [navigate]);

  return { view, moduleId, navigate };
}

export type { View, NavState };
