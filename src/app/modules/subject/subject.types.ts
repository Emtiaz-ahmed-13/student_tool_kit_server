export interface ISubject {
  id?: string;
  name: string;
  code?: string | null;
  type: SubjectType;
  description?: string | null;
  credits?: number | null;
  instructor?: string | null;

  // Semester information (for courses)
  semester?: string | null;
  semesterStart?: Date | null;
  semesterEnd?: Date | null;
  duration?: SemesterDuration | null;

  // Exam information (for subjects)
  nextExamDate?: Date | null;
  examType?: string | null;
  isExamImportant?: boolean;

  // Study tracking
  targetHoursPerWeek?: number | null;
  totalHoursStudied?: number;

  // Visual
  color?: string;
  isArchived?: boolean;

  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubjectCreate {
  name: string;
  code?: string;
  type: SubjectType;
  description?: string;
  credits?: number;
  instructor?: string;

  // Semester information (for courses)
  semester?: string;
  semesterStart?: string; // ISO date string
  semesterEnd?: string; // ISO date string
  duration?: SemesterDuration;

  // Exam information (for subjects)
  nextExamDate?: string; // ISO date string
  examType?: string;
  isExamImportant?: boolean;

  // Study tracking
  targetHoursPerWeek?: number;

  // Visual
  color?: string;
}

export interface ISubjectUpdate {
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
  instructor?: string;

  // Semester information
  semester?: string;
  semesterStart?: string;
  semesterEnd?: string;
  duration?: SemesterDuration;

  // Exam information
  nextExamDate?: string;
  examType?: string;
  isExamImportant?: boolean;

  // Study tracking
  targetHoursPerWeek?: number;

  // Visual
  color?: string;
  isArchived?: boolean;
}

export interface ISubjectFilters {
  type?: SubjectType;
  semester?: string;
  instructor?: string;
  isArchived?: boolean;
  hasUpcomingExam?: boolean;
  search?: string; // Search in name, code, or description
}

export interface IStudySession {
  id?: string;
  date?: Date;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  productivity?: number; // 1-10 scale
  subjectId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudySessionCreate {
  subjectId: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  notes?: string;
  productivity?: number;
}

export interface IStudySessionUpdate {
  endTime?: string;
  notes?: string;
  productivity?: number;
}

export interface IFocusSession {
  id?: string;
  mode: FocusMode;
  status: SessionStatus;

  // Session timing
  plannedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  endTime?: Date;
  pausedAt?: Date;
  pauseDuration?: number;

  // Custom focus mode settings
  focusDuration?: number;
  breakDuration?: number;

  // Session data
  notes?: string;
  distractions?: number;
  effectiveness?: number; // 1-10 scale

  subjectId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFocusSessionCreate {
  mode: FocusMode;
  plannedDuration: number;
  focusDuration?: number; // For custom mode
  breakDuration?: number; // For custom mode
  subjectId?: string;
  notes?: string;
}

export interface IFocusSessionUpdate {
  status?: SessionStatus;
  endTime?: string;
  pausedAt?: string;
  pauseDuration?: number;
  notes?: string;
  distractions?: number;
  effectiveness?: number;
}

export interface ISubjectAnalytics {
  subject: ISubject;
  weeklyProgress: {
    totalHours: number;
    targetHours: number;
    progressPercentage: number;
    dailyBreakdown: Array<{
      date: string;
      hours: number;
    }>;
  };
  overallProgress: {
    totalHoursStudied: number;
    averageSessionDuration: number;
    totalSessions: number;
    averageProductivity: number;
  };
  upcomingEvents: Array<{
    type: "exam" | "deadline";
    date: Date;
    description: string;
  }>;
}

export interface ITimeTracking {
  daily: Array<{
    date: string;
    totalHours: number;
    sessions: number;
    subjects: Array<{
      subjectId: string;
      subjectName: string;
      hours: number;
      color: string;
    }>;
  }>;
  weekly: {
    totalHours: number;
    averagePerDay: number;
    mostStudiedSubject: {
      id: string;
      name: string;
      hours: number;
    };
    leastStudiedSubject: {
      id: string;
      name: string;
      hours: number;
    };
  };
  monthly: {
    totalHours: number;
    averagePerWeek: number;
    progressTrend: "increasing" | "decreasing" | "stable";
    monthlyGoalProgress: number; // percentage
  };
}

export interface IFocusModePresets {
  POMODORO: {
    focusDuration: 25;
    breakDuration: 5;
    longBreakDuration: 15;
    cyclesBeforeLongBreak: 4;
  };
  DEEP_WORK: {
    focusDuration: 90;
    breakDuration: 20;
  };
  MARATHON: {
    focusDuration: 120;
    breakDuration: 30;
  };
}

// Enums from Prisma
export enum SubjectType {
  COURSE = "COURSE",
  SUBJECT = "SUBJECT",
}

export enum SemesterDuration {
  THREE_MONTHS = "THREE_MONTHS",
  SIX_MONTHS = "SIX_MONTHS",
  FOUR_MONTHS = "FOUR_MONTHS",
  ANNUAL = "ANNUAL",
}

export enum FocusMode {
  POMODORO = "POMODORO",
  DEEP_WORK = "DEEP_WORK",
  CUSTOM = "CUSTOM",
  MARATHON = "MARATHON",
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const DEFAULT_SUBJECT_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
] as const;

export const FOCUS_MODE_PRESETS: IFocusModePresets = {
  POMODORO: {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
  },
  DEEP_WORK: {
    focusDuration: 90,
    breakDuration: 20,
  },
  MARATHON: {
    focusDuration: 120,
    breakDuration: 30,
  },
};
