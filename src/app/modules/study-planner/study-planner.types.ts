export interface IStudyPlan {
  id?: string;
  title: string;
  subject: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  deadline?: Date | null;
  estimatedHours?: number | null;
  userId: string;
  tasks?: IStudyTask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudyTask {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  studyPlanId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudyPlanCreate {
  title: string;
  subject: string;
  description?: string;
  priority: Priority;
  deadline?: Date;
  estimatedHours?: number;
  tasks?: IStudyTaskCreate[];
}

export interface IStudyPlanUpdate {
  title?: string;
  subject?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: Date;
  estimatedHours?: number;
}

export interface IStudyTaskCreate {
  title: string;
  description?: string;
  dueDate?: Date;
}

export interface IStudyTaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IStudyPlanFilters {
  subject?: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: string;
  upcomingDays?: number;
}

export interface IStudyAnalytics {
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
  pendingPlans: number;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  subjectBreakdown: { subject: string; count: number; completed: number }[];
  priorityBreakdown: { priority: Priority; count: number }[];
  upcomingDeadlines: IStudyPlan[];
}

export interface ITimeAllocation {
  subject: string;
  estimatedHours: number;
  actualHours?: number;
  efficiency?: number;
}

export interface IPlanningSession {
  date: Date;
  timeSlot: string;
  subject: string;
  studyPlanId: string;
  duration: number; // in minutes
  completed: boolean;
}

// Study session time slots
export const TIME_SLOTS = [
  "06:00-08:00", // Early Morning
  "08:00-10:00", // Morning
  "10:00-12:00", // Late Morning
  "12:00-14:00", // Afternoon
  "14:00-16:00", // Early Afternoon
  "16:00-18:00", // Late Afternoon
  "18:00-20:00", // Evening
  "20:00-22:00", // Night
  "22:00-24:00", // Late Night
] as const;

export const PRIORITY_WEIGHTS = {
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
} as const;

export const STATUS_COLORS = {
  [TaskStatus.PENDING]: "#FCD34D",
  [TaskStatus.IN_PROGRESS]: "#3B82F6",
  [TaskStatus.COMPLETED]: "#10B981",
} as const;
