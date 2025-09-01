export interface IClass {
  id?: string;
  subject: string;
  instructor?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  color?: string;
  description?: string | null;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClassCreate {
  subject: string;
  instructor?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location?: string;
  color?: string;
  description?: string;
}

export interface IClassUpdate {
  subject?: string;
  instructor?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  color?: string;
  description?: string;
}

export interface IClassFilters {
  dayOfWeek?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
}

export interface IWeeklySchedule {
  [key: string]: IClass[]; // key is day of week
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
] as const;
