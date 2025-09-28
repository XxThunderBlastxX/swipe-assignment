import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InterviewStore,
  InterviewSession,
  CandidateInfo,
  Answer,
  Question,
  QuestionDifficulty,
} from "~/types/interview";

// Question templates for full stack (React/Node) role
const questionTemplates = {
  Easy: [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain what React components are and how they work.",
    "What is the purpose of package.json in a Node.js project?",
    "How do you handle CSS styling in React applications?",
    "What is the difference between synchronous and asynchronous JavaScript?",
    "Explain what props are in React and how to use them.",
  ],
  Medium: [
    "Explain the concept of React Hooks and give examples of useState and useEffect.",
    "What is middleware in Express.js and how would you implement authentication middleware?",
    "How would you optimize a React application for better performance?",
    "Explain the difference between REST and GraphQL APIs.",
    "What are React lifecycle methods and how do they relate to hooks?",
    "How would you handle error handling in a Node.js Express application?",
  ],
  Hard: [
    "Implement a custom React hook for managing form state with validation.",
    "Design a scalable Node.js architecture for a high-traffic e-commerce application.",
    "Explain React's reconciliation algorithm and virtual DOM diffing.",
    "How would you implement real-time features using WebSockets in a React/Node.js app?",
    "Design a caching strategy for a full-stack application with Redis and database optimization.",
    "Implement a secure authentication system with JWT, refresh tokens, and role-based access control.",
  ],
};

const getTimeLimit = (difficulty: QuestionDifficulty): number => {
  switch (difficulty) {
    case "Easy":
      return 20;
    case "Medium":
      return 60;
    case "Hard":
      return 120;
  }
};

const generateQuestions = (): Question[] => {
  const questions: Question[] = [];
  const difficulties: QuestionDifficulty[] = [
    "Easy",
    "Easy",
    "Medium",
    "Medium",
    "Hard",
    "Hard",
  ];

  difficulties.forEach((difficulty, index) => {
    const templates = questionTemplates[difficulty];
    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    if (randomTemplate) {
      questions.push({
        id: `q-${index + 1}`,
        text: randomTemplate,
        difficulty,
        timeLimit: getTimeLimit(difficulty),
        category: "Full Stack Development",
      });
    }
  });

  return questions;
};

const calculateScore = (answers: Answer[], questions: Question[]): number => {
  if (answers.length === 0) return 0;

  let totalScore = 0;

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    let baseScore = 0;
    switch (question.difficulty) {
      case "Easy":
        baseScore = 10;
        break;
      case "Medium":
        baseScore = 20;
        break;
      case "Hard":
        baseScore = 30;
        break;
    }

    // Reduce score if timed out
    if (answer.isTimedOut) {
      baseScore *= 0.5;
    }

    // Simple scoring based on answer length (can be enhanced with AI)
    const answerQuality = Math.min(answer.text.trim().length / 100, 1);
    totalScore += baseScore * answerQuality;
  });

  return Math.round(totalScore);
};

const generateSummary = (session: InterviewSession): string => {
  const { answers, questions, score = 0 } = session;

  const completedAnswers = answers.length;
  const timedOutAnswers = answers.filter((a) => a.isTimedOut).length;

  let performance = "Poor";
  if (score >= 80) performance = "Excellent";
  else if (score >= 60) performance = "Good";
  else if (score >= 40) performance = "Average";

  const difficultyBreakdown = {
    Easy: answers.filter(
      (a) =>
        questions.find((q) => q.id === a.questionId)?.difficulty === "Easy",
    ).length,
    Medium: answers.filter(
      (a) =>
        questions.find((q) => q.id === a.questionId)?.difficulty === "Medium",
    ).length,
    Hard: answers.filter(
      (a) =>
        questions.find((q) => q.id === a.questionId)?.difficulty === "Hard",
    ).length,
  };

  return `${performance} performance with ${score}/180 points. Completed ${completedAnswers}/6 questions. ${timedOutAnswers} questions timed out. Difficulty breakdown: Easy (${difficultyBreakdown.Easy}/2), Medium (${difficultyBreakdown.Medium}/2), Hard (${difficultyBreakdown.Hard}/2).`;
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createSession: (candidateInfo: CandidateInfo) => {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newSession: InterviewSession = {
          id: sessionId,
          candidateInfo,
          questions: generateQuestions(),
          answers: [],
          currentQuestionIndex: 0,
          status: "not-started",
          startedAt: new Date(),
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: sessionId,
        }));

        return sessionId;
      },

      updateSession: (
        sessionId: string,
        updates: Partial<InterviewSession>,
      ) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...updates } : session,
          ),
        }));
      },

      getCurrentSession: () => {
        const state = get();
        return (
          state.sessions.find(
            (session) => session.id === state.currentSessionId,
          ) || null
        );
      },

      submitAnswer: (sessionId: string, answer: Answer) => {
        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                answers: [...session.answers, answer],
              };
            }
            return session;
          });

          return { sessions };
        });
      },

      moveToNextQuestion: (sessionId: string) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);

        if (
          session &&
          session.currentQuestionIndex < session.questions.length - 1
        ) {
          get().updateSession(sessionId, {
            currentQuestionIndex: session.currentQuestionIndex + 1,
            timeRemaining: undefined,
          });
        } else if (
          session &&
          session.currentQuestionIndex === session.questions.length - 1
        ) {
          // Interview completed
          const score = calculateScore(session.answers, session.questions);
          const summary = generateSummary({ ...session, score });

          get().completeInterview(sessionId, score, summary);
        }
      },

      completeInterview: (
        sessionId: string,
        score: number,
        summary: string,
      ) => {
        get().updateSession(sessionId, {
          status: "completed",
          score,
          summary,
          completedAt: new Date(),
          timeRemaining: undefined,
        });
      },

      restoreSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },
    }),
    {
      name: "interview-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    },
  ),
);
