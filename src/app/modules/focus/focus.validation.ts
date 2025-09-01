import { z } from "zod";
import { FocusMode } from "./focus.types";

// Create Focus Habit
export const createFocusHabitSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Habit name is required",
      })
      .min(3, "Habit name must be at least 3 characters"),
    focusMode: z.nativeEnum(FocusMode, {
      required_error: "Focus mode is required",
    }),
    targetDays: z
      .number({
        required_error: "Target days is required",
      })
      .min(7, "Target days must be at least 7")
      .max(365, "Target days cannot exceed 365"),
    focusDuration: z.number().min(5).max(240).optional(),
    breakDuration: z.number().min(1).max(60).optional(),
    sessionsPerDay: z.number().min(1).max(10).optional().default(1),
    subjectId: z.string().uuid().optional(),
  }),
});

// Update Focus Habit
export const updateFocusHabitSchema = z.object({
  params: z.object({
    id: z.string().uuid({
      message: "Invalid habit ID format",
    }),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    focusMode: z.nativeEnum(FocusMode).optional(),
    targetDays: z.number().min(7).max(365).optional(),
    focusDuration: z.number().min(5).max(240).optional(),
    breakDuration: z.number().min(1).max(60).optional(),
    sessionsPerDay: z.number().min(1).max(10).optional(),
    isActive: z.boolean().optional(),
    subjectId: z.string().uuid().optional(),
  }),
});

// Get Focus Habits
export const getFocusHabitsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional().default("1"),
    limit: z.string().transform(Number).optional().default("10"),
    status: z
      .enum(["active", "completed", "paused", "all"])
      .optional()
      .default("active"),
    subjectId: z.string().uuid().optional(),
    sortBy: z
      .enum(["name", "progress", "streak", "created"])
      .optional()
      .default("created"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// Get Focus Habit by ID
export const getFocusHabitSchema = z.object({
  params: z.object({
    id: z.string().uuid({
      message: "Invalid habit ID format",
    }),
  }),
});

// Delete Focus Habit
export const deleteFocusHabitSchema = z.object({
  params: z.object({
    id: z.string().uuid({
      message: "Invalid habit ID format",
    }),
  }),
});

// Log Habit Session
export const logHabitSessionSchema = z.object({
  params: z.object({
    habitId: z.string().uuid({
      message: "Invalid habit ID format",
    }),
  }),
  body: z.object({
    date: z.string().datetime().optional(),
    completed: z.boolean().default(true),
    effectiveness: z.number().min(1).max(10).optional(),
    notes: z.string().max(500).optional(),
    completedSessions: z.number().min(0).max(20).default(1),
  }),
});

// Get Habit Progress
export const getHabitProgressSchema = z.object({
  params: z.object({
    habitId: z.string().uuid({
      message: "Invalid habit ID format",
    }),
  }),
  query: z.object({
    period: z.enum(["week", "month", "all"]).optional().default("month"),
    includeDetails: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});

// Get Focus Analytics
export const getFocusAnalyticsSchema = z.object({
  query: z.object({
    period: z
      .enum(["week", "month", "quarter", "year"])
      .optional()
      .default("month"),
    subjectId: z.string().uuid().optional(),
    includeRecommendations: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});

// Get Focus Methods
export const getFocusMethodsSchema = z.object({
  query: z.object({
    category: z
      .enum([
        "POMODORO",
        "DEEP_WORK",
        "MEDITATION",
        "SCIENCE_BACKED",
        "HABIT_FORMATION",
        "SUBJECT_SPECIFIC",
      ])
      .optional(),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    subject: z
      .enum(["PHYSICS", "MATHEMATICS", "COMPUTER_SCIENCE", "CHESS"])
      .optional(),
    minDuration: z.string().transform(Number).optional(),
    maxDuration: z.string().transform(Number).optional(),
  }),
});

// Start Focus Session with Method
export const startFocusSessionSchema = z.object({
  body: z.object({
    methodId: z.string({
      required_error: "Focus method ID is required",
    }),
    subjectId: z.string().uuid().optional(),
    customDuration: z.number().min(5).max(240).optional(),
    customBreakDuration: z.number().min(1).max(60).optional(),
    notes: z.string().max(500).optional(),
    habitId: z.string().uuid().optional(), // Link to habit if applicable
  }),
});

// Complete Focus Session
export const completeFocusSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid({
      message: "Invalid session ID format",
    }),
  }),
  body: z.object({
    effectiveness: z.number().min(1).max(10).optional(),
    distractions: z.number().min(0).max(100).optional().default(0),
    notes: z.string().max(1000).optional(),
    completedFully: z.boolean().default(true),
  }),
});

// Pause/Resume Focus Session
export const pauseFocusSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid({
      message: "Invalid session ID format",
    }),
  }),
  body: z.object({
    action: z.enum(["pause", "resume"], {
      required_error: "Action must be either pause or resume",
    }),
  }),
});

// Get Focus Recommendations
export const getFocusRecommendationsSchema = z.object({
  query: z.object({
    subject: z
      .enum(["PHYSICS", "MATHEMATICS", "COMPUTER_SCIENCE", "CHESS"])
      .optional(),
    currentLevel: z
      .enum(["Beginner", "Intermediate", "Advanced"])
      .optional()
      .default("Beginner"),
    goalType: z
      .enum(["habit_formation", "productivity", "deep_learning", "exam_prep"])
      .optional()
      .default("productivity"),
    availableTime: z.string().transform(Number).optional(), // minutes per session
  }),
});

export default {
  createFocusHabitSchema,
  updateFocusHabitSchema,
  getFocusHabitsSchema,
  getFocusHabitSchema,
  deleteFocusHabitSchema,
  logHabitSessionSchema,
  getHabitProgressSchema,
  getFocusAnalyticsSchema,
  getFocusMethodsSchema,
  startFocusSessionSchema,
  completeFocusSessionSchema,
  pauseFocusSessionSchema,
  getFocusRecommendationsSchema,
};
