export type ModuleState = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE" | "ORDER" | "CODE_FILL" | "BUG_HUNT";
export type QuizMode = "NORMAL" | "MIXED" | "ERROR_REVIEW";

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  state: ModuleState;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  examples: string[];
}

export interface ModuleDetail {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  type: QuestionType;
  codeTemplate?: string;
  blanks?: string[];
  code?: string;
  explanation?: string;
  difficulty?: string;
  moduleId?: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  feedback: QuestionFeedback[];
}

export interface QuestionStats {
  correct: number;
  wrong: number;
  streak: number;
}

export interface Attempt {
  quizId: string;
  mode: QuizMode;
  moduleIds: string[];
  score: number;
  total: number;
  passed: boolean;
  durationSeconds: number;
  date: string;
}

export interface Progress {
  moduleStates: Record<string, ModuleState>;
  overallPercent: number;
  questionStats: Record<string, QuestionStats>;
  attempts: Attempt[];
}
