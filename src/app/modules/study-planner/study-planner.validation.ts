import { z } from "zod";
import { Priority, TaskStatus } from "./study-planner.types";

export const createStudyPlanSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
      })
      .min(1, "Title cannot be empty"),

    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(1, "Subject cannot be empty"),

    description: z.string().optional(),

    priority: z.nativeEnum(Priority, {
      required_error: "Priority is required",
      invalid_type_error: "Invalid priority level",
    }),

    deadline: z.string().datetime().optional(),

    estimatedHours: z.number().positive().optional(),

    tasks: z
      .array(
        z.object({
          title: z.string().min(1, "Task title cannot be empty"),
          description: z.string().optional(),
          dueDate: z.string().datetime().optional(),
        })
      )
      .optional(),
  }),
});

export const updateStudyPlanSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    subject: z.string().min(1, "Subject cannot be empty").optional(),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    deadline: z.string().datetime().optional(),
    estimatedHours: z.number().positive().optional(),
  }),
});

export const getStudyPlansSchema = z.object({
  query: z.object({
    subject: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    deadline: z.string().datetime().optional(),
    upcomingDays: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getStudyPlanSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Study plan ID is required",
    }),
  }),
});

export const deleteStudyPlanSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Study plan ID is required",
    }),
  }),
});

export const createStudyTaskSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Task title is required",
      })
      .min(1, "Task title cannot be empty"),

    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
  params: z.object({
    planId: z.string({
      required_error: "Study plan ID is required",
    }),
  }),
});

export const updateStudyTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Task title cannot be empty").optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().optional(),
  }),
  params: z.object({
    planId: z.string({
      required_error: "Study plan ID is required",
    }),
    taskId: z.string({
      required_error: "Task ID is required",
    }),
  }),
});

export const deleteStudyTaskSchema = z.object({
  params: z.object({
    planId: z.string({
      required_error: "Study plan ID is required",
    }),
    taskId: z.string({
      required_error: "Task ID is required",
    }),
  }),
});

export const getAnalyticsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    subject: z.string().optional(),
  }),
});
