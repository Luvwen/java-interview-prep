import type {
  ModuleDetail,
  ModuleSummary,
  Progress,
  Quiz,
  QuizResult,
  RealWorldCase,
} from "./types";
import { progressStore } from "./store/ProgressStore";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    throw new ApiError(response.status, `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  listModules: () => request<ModuleSummary[]>("/api/modules"),

  getModule: (id: string) => request<ModuleDetail>(`/api/modules/${id}`),

  getQuiz: (id: string, difficulty?: string, moduleIds?: string[]) => {
    const params = new URLSearchParams();
    if (difficulty) params.set("difficulty", difficulty);
    if (moduleIds && moduleIds.length > 0) params.set("moduleIds", moduleIds.join(","));
    const qs = params.toString();
    return request<Quiz>(`/api/modules/${id}/quiz${qs ? "?" + qs : ""}`);
  },

  submitQuiz: (id: string, answers: number[][], textAnswers?: Record<string, string[]>) =>
    request<QuizResult>(`/api/modules/${id}/quiz`, {
      method: "POST",
      body: JSON.stringify({ answers, textAnswers: textAnswers ?? null }),
    }),

  completeModule: (id: string) => {
    progressStore.markModule(id, "COMPLETED");
    return request<void>(`/api/modules/${id}/complete`, { method: "POST" });
  },

  getProgress: (): Promise<Progress> => Promise.resolve(progressStore.getProgress()),

  resetProgress: (): Promise<void> => {
    progressStore.reset();
    return Promise.resolve();
  },

  getMixedQuiz: (moduleIds: string[], count: number) =>
    request<Quiz>("/api/quiz/mixed", {
      method: "POST",
      body: JSON.stringify({ moduleIds, count }),
    }),

  getErrorReviewQuiz: () =>
    request<Quiz>("/api/quiz/errors", {
      method: "POST",
      body: JSON.stringify({}),
    }),

  submitQuizV2: (
    quizId: string,
    moduleIds: string[],
    answers: number[][],
    durationSeconds?: number,
    textAnswers?: Record<string, string[]>,
    questionIds?: string[]
  ) =>
    request<QuizResult>("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ quizId, moduleIds, answers, durationSeconds, textAnswers: textAnswers ?? null, questionIds: questionIds ?? null }),
    }),

  getStats: (): Promise<Record<string, ModuleStats>> => {
    const progress = progressStore.getProgress();
    const result: Record<string, ModuleStats> = {};
    for (const [moduleId, stats] of Object.entries(progress.questionStats)) {
      const moduleAttempts = progress.attempts.filter((a) => a.moduleIds.includes(moduleId));
      const total = stats.correct + stats.wrong;
      result[moduleId] = {
        moduleId,
        title: moduleId,
        correct: stats.correct,
        wrong: stats.wrong,
        bestPercent: total > 0 ? Math.round((stats.correct * 100) / total) : 0,
        avgPercent: total > 0 ? Math.round((stats.correct * 100) / total) : 0,
        avgTimeSeconds: moduleAttempts.length > 0
          ? Math.round(moduleAttempts.reduce((s, a) => s + a.durationSeconds, 0) / moduleAttempts.length)
          : 0,
        attempts: moduleAttempts.length,
      };
    }
    return Promise.resolve(result);
  },

  getStreak: (): Promise<{ current: number; lastDate: string | null }> => {
    const progress = progressStore.getProgress();
    const dates = [...new Set(progress.attempts.map((a) => a.date.split("T")[0]))].sort().reverse();
    let current = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = today;
    for (const d of dates) {
      if (d === checkDate) {
        current++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().split("T")[0];
      } else {
        break;
      }
    }
    return Promise.resolve({ current, lastDate: dates[0] ?? null });
  },

  fetchRealWorldCases: () => request<RealWorldCase[]>("/api/real-world"),
};

interface ModuleStats {
  moduleId: string;
  title: string;
  correct: number;
  wrong: number;
  bestPercent: number;
  avgPercent: number;
  avgTimeSeconds: number;
  attempts: number;
}
