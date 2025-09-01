import { z } from "zod";
import { DAYS_OF_WEEK } from "./class.types";

// Time validation regex (HH:MM format)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Hex color validation regex
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createClassSchema = z.object({
  body: z
    .object({
      subject: z
        .string({
          required_error: "Subject is required",
        })
        .min(1, "Subject cannot be empty"),

      instructor: z.string().optional(),

      dayOfWeek: z.enum(DAYS_OF_WEEK, {
        required_error: "Day of week is required",
        invalid_type_error: "Invalid day of week",
      }),

      startTime: z
        .string({
          required_error: "Start time is required",
        })
        .regex(timeRegex, "Start time must be in HH:MM format"),

      endTime: z
        .string({
          required_error: "End time is required",
        })
        .regex(timeRegex, "End time must be in HH:MM format"),

      location: z.string().optional(),

      color: z
        .string()
        .regex(hexColorRegex, "Color must be a valid hex color")
        .optional(),

      description: z.string().optional(),
    })
    .refine(
      (data) => {
        // Validate that end time is after start time
        const [startHour, startMin] = data.startTime.split(":").map(Number);
        const [endHour, endMin] = data.endTime.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return endMinutes > startMinutes;
      },
      {
        message: "End time must be after start time",
        path: ["endTime"],
      }
    ),
});

export const updateClassSchema = z.object({
  body: z
    .object({
      subject: z.string().min(1, "Subject cannot be empty").optional(),
      instructor: z.string().optional(),
      dayOfWeek: z.enum(DAYS_OF_WEEK).optional(),
      startTime: z
        .string()
        .regex(timeRegex, "Start time must be in HH:MM format")
        .optional(),
      endTime: z
        .string()
        .regex(timeRegex, "End time must be in HH:MM format")
        .optional(),
      location: z.string().optional(),
      color: z
        .string()
        .regex(hexColorRegex, "Color must be a valid hex color")
        .optional(),
      description: z.string().optional(),
    })
    .refine(
      (data) => {
        // Validate time order if both times are provided
        if (data.startTime && data.endTime) {
          const [startHour, startMin] = data.startTime.split(":").map(Number);
          const [endHour, endMin] = data.endTime.split(":").map(Number);

          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          return endMinutes > startMinutes;
        }
        return true;
      },
      {
        message: "End time must be after start time",
        path: ["endTime"],
      }
    ),
});

export const getClassesSchema = z.object({
  query: z.object({
    dayOfWeek: z.enum(DAYS_OF_WEEK).optional(),
    subject: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getClassSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Class ID is required",
    }),
  }),
});

export const deleteClassSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Class ID is required",
    }),
  }),
});
