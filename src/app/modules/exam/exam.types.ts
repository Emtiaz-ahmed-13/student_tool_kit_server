export interface IExamQuestion {
  id?: string;
  subject: string;
  question: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options: string[];
  correctAnswer?: string | null;
  explanation?: string | null;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamQuestionCreate {
  subject: string;
  question: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface IExamQuestionUpdate {
  subject?: string;
  question?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export enum QuestionType {
  MCQ = "MCQ",
  SHORT_ANSWER = "SHORT_ANSWER",
  TRUE_FALSE = "TRUE_FALSE",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export interface IExamQuestionFilters {
  subject?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
}

export interface IQuizGeneration {
  subject?: string;
  difficulty?: Difficulty;
  questionType?: QuestionType;
  count: number;
}

export interface IQuizSession {
  id: string;
  questions: IExamQuestion[];
  userAnswers: { [questionId: string]: string };
  score?: number;
  totalQuestions: number;
  correctAnswers?: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
}

export interface IQuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  duration: number;
  breakdown: {
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string | null;
  }[];
}

// Pre-defined question templates for different subjects
export const QUESTION_TEMPLATES = {
  Mathematics: [
    {
      template: "Solve the equation: {equation}",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.MEDIUM,
    },
    {
      template: "What is the derivative of {function}?",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.HARD,
    },
  ],
  Science: [
    {
      template: "What is the chemical formula for {compound}?",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.EASY,
    },
    {
      template: "Explain the process of {process}",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.MEDIUM,
    },
  ],
  History: [
    {
      template: "In which year did {event} occur?",
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
    },
    {
      template: "Who was the leader of {country} during {period}?",
      type: QuestionType.MCQ,
      difficulty: Difficulty.MEDIUM,
    },
  ],
  Literature: [
    {
      template: "Who wrote '{book_title}'?",
      type: QuestionType.MCQ,
      difficulty: Difficulty.EASY,
    },
    {
      template: "What is the main theme of '{book_title}'?",
      type: QuestionType.SHORT_ANSWER,
      difficulty: Difficulty.MEDIUM,
    },
  ],
} as const;

export const COMMON_SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
  "Economics",
  "Psychology",
  "Philosophy",
  "Sociology",
] as const;
