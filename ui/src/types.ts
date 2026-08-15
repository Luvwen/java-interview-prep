export type ModuleState = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE" | "ORDER" | "CODE_FILL" | "BUG_HUNT";
export type QuizMode = "NORMAL" | "MIXED" | "ERROR_REVIEW";

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  state: ModuleState;
}

export interface TopicSection {
  title: string;
  text: string;
  code?: string;
}

export interface Topic {
  id: string;
  title: string;
  content: string;
  examples: string[];
  sections?: TopicSection[];
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
  correctIndexes?: number[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  questionType: string;
  correct: boolean;
  explanation: string;
  userAnswer: number[];
  correctAnswer: number[];
  options: string[];
  userTextAnswer: string[];
  correctTextAnswer: string[];
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

export interface RealWorldSection {
  title: string;
  text: string;
  code?: string;
}

export interface RealWorldSolutionFile {
  path: string;
  code: string;
}

export interface RealWorldExerciseSolution {
  files: RealWorldSolutionFile[];
}

export interface RealWorldExercise {
  title: string;
  description: string;
  hints: string[];
  solution: RealWorldExerciseSolution | null;
}

export interface RealWorldCase {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  problem: string;
  sections: RealWorldSection[];
  keyPoints: string[];
  interviewQuestions: string[];
  exercises: RealWorldExercise[];
}

export interface LabStep {
  line: number;
  explanation: string;
}

export interface LabExercise {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  theory: string;
  code: string;
  expectedOutput: string;
  steps: LabStep[];
}
