// Interview Types
export type InterviewType = "technical" | "hr" | "aptitude";
export type InterviewDifficulty = "easy" | "medium" | "hard";
export type InterviewLanguage =
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "react"
  | "nodejs"
  | "sql"
  | "system-design";

export interface InterviewConfig {
  language: InterviewLanguage | "";
  difficulty: InterviewDifficulty | "";
  type: InterviewType | "";
}

// Message Types
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Session Types
export interface ChatSession {
  id: string;
  config: InterviewConfig;
  messages: Message[];
  startedAt: Date;
  endedAt?: Date;
  currentQuestion: number;
  totalQuestions: number;
  isActive: boolean;
}

// Language Option
export interface LanguageOption {
  value: InterviewLanguage;
  label: string;
  icon: React.ReactNode;
}

// Difficulty Option
export interface DifficultyOption {
  value: InterviewDifficulty;
  label: string;
  description: string;
  color: string;
}

// Interview Type Option
export interface InterviewTypeOption {
  value: InterviewType;
  label: string;
  description: string;
  icon: React.ReactNode;
}
