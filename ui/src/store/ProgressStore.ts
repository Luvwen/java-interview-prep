import type { Attempt, ModuleState, Progress, QuestionStats, QuizMode } from "../types";

const STORAGE_KEY = "javatheory_progress";

interface StoredProgress {
  moduleStates: Record<string, ModuleState>;
  questionStats: Record<string, QuestionStats>;
  attempts: Attempt[];
}

function load(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      moduleStates: parsed.moduleStates ?? {},
      questionStats: parsed.questionStats ?? {},
      attempts: parsed.attempts ?? [],
    };
  } catch {
    return empty();
  }
}

function save(data: StoredProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function empty(): StoredProgress {
  return { moduleStates: {}, questionStats: {}, attempts: [] };
}

function computeOverallPercent(moduleStates: Record<string, ModuleState>): number {
  const ids = Object.keys(moduleStates);
  if (ids.length === 0) return 0;
  const completed = ids.filter((id) => moduleStates[id] === "COMPLETED").length;
  return Math.round((completed / ids.length) * 100);
}

export const progressStore = {
  getProgress(): Progress {
    const data = load();
    return {
      moduleStates: data.moduleStates,
      overallPercent: computeOverallPercent(data.moduleStates),
      questionStats: data.questionStats,
      attempts: data.attempts,
    };
  },

  markModule(moduleId: string, state: ModuleState): void {
    const data = load();
    data.moduleStates[moduleId] = state;
    save(data);
  },

  recordQuizResult(
    moduleId: string,
    score: number,
    total: number,
    passed: boolean,
    mode: QuizMode,
    moduleIds: string[],
    durationSeconds?: number
  ): void {
    const data = load();

    const attempt: Attempt = {
      quizId: `${mode}-${Date.now()}`,
      mode,
      moduleIds,
      score,
      total,
      passed,
      durationSeconds: durationSeconds ?? 0,
      date: new Date().toISOString(),
    };
    data.attempts.push(attempt);

    if (!data.questionStats[moduleId]) {
      data.questionStats[moduleId] = { correct: 0, wrong: 0, streak: 0 };
    }
    const stats = data.questionStats[moduleId];
    if (passed) {
      stats.correct += 1;
      stats.streak += 1;
    } else {
      stats.wrong += 1;
      stats.streak = 0;
    }

    save(data);
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
