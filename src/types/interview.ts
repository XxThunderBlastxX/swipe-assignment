export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
  category: string;
}

export interface Answer {
  questionId: string;
  text: string;
  timeSpent: number; // in seconds
  isTimedOut: boolean;
  timestamp: Date;
}

export interface InterviewSession {
  id: string;
  candidateInfo: CandidateInfo;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  summary?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeRemaining?: number; // current question time remaining
}

export interface InterviewStore {
  sessions: InterviewSession[];
  currentSessionId: string | null;

  // Actions
  createSession: (candidateInfo: CandidateInfo) => string;
  updateSession: (sessionId: string, updates: Partial<InterviewSession>) => void;
  getCurrentSession: () => InterviewSession | null;
  submitAnswer: (sessionId: string, answer: Answer) => void;
  moveToNextQuestion: (sessionId: string) => void;
  completeInterview: (sessionId: string, score: number, summary: string) => void;
  restoreSession: (sessionId: string) => void;
}

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionTemplate {
  difficulty: QuestionDifficulty;
  category: string;
  templates: string[];
}
