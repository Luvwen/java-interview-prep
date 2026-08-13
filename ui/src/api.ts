import type {
  ModuleDetail,
  ModuleSummary,
  Progress,
  Quiz,
  QuizResult,
  RealWorldCase,
} from "./types";

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

  completeModule: (id: string) =>
    request<void>(`/api/modules/${id}/complete`, { method: "POST" }),

  getProgress: () => request<Progress>("/api/progress"),

  resetProgress: () =>
    request<void>("/api/progress", { method: "DELETE" }),

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

  getStats: () => request<Record<string, ModuleStats>>("/api/stats"),

  getStreak: () => request<{ current: number; lastDate: string | null }>("/api/streak"),

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
