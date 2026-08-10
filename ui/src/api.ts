import type {
  ModuleDetail,
  ModuleSummary,
  Progress,
  Quiz,
  QuizResult,
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

  getQuiz: (id: string) => request<Quiz>(`/api/modules/${id}/quiz`),

  submitQuiz: (id: string, answers: number[][]) =>
    request<QuizResult>(`/api/modules/${id}/quiz`, {
      method: "POST",
      body: JSON.stringify({ answers }),
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
    durationSeconds?: number
  ) =>
    request<QuizResult>("/api/quiz/submit", {
      method: "POST",
      body: JSON.stringify({ quizId, moduleIds, answers, durationSeconds }),
    }),
};
