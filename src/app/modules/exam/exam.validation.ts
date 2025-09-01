import { z } from "zod";
import { Difficulty, QuestionType } from "./exam.types";

export const createExamQuestionSchema = z.object({
  body: z
    .object({
      subject: z
        .string({
          required_error: "Subject is required",
        })
        .min(1, "Subject cannot be empty"),

      question: z
        .string({
          required_error: "Question is required",
        })
        .min(10, "Question must be at least 10 characters long"),

      questionType: z.nativeEnum(QuestionType, {
        required_error: "Question type is required",
        invalid_type_error: "Invalid question type",
      }),

      difficulty: z.nativeEnum(Difficulty, {
        required_error: "Difficulty is required",
        invalid_type_error: "Invalid difficulty level",
      }),

      options: z.array(z.string()).optional(),

      correctAnswer: z.string().optional(),

      explanation: z.string().optional(),
    })
    .refine(
      (data) => {
        // For MCQ and TRUE_FALSE questions, options and correctAnswer are required
        if (data.questionType === QuestionType.MCQ) {
          return data.options && data.options.length >= 2 && data.correctAnswer;
        }
        if (data.questionType === QuestionType.TRUE_FALSE) {
          return (
            data.options && data.options.length === 2 && data.correctAnswer
          );
        }
        return true;
      },
      {
        message:
          "MCQ questions require at least 2 options and a correct answer. TRUE_FALSE questions require exactly 2 options and a correct answer.",
        path: ["options"],
      }
    ),
});

export const updateExamQuestionSchema = z.object({
  body: z.object({
    subject: z.string().min(1, "Subject cannot be empty").optional(),
    question: z
      .string()
      .min(10, "Question must be at least 10 characters long")
      .optional(),
    questionType: z.nativeEnum(QuestionType).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
  }),
});

export const getExamQuestionsSchema = z.object({
  query: z.object({
    subject: z.string().optional(),
    questionType: z.nativeEnum(QuestionType).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getExamQuestionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Question ID is required",
    }),
  }),
});

export const deleteExamQuestionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Question ID is required",
    }),
  }),
});

export const generateQuizSchema = z.object({
  body: z.object({
    subject: z.string().optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    questionType: z.nativeEnum(QuestionType).optional(),
    count: z
      .number({
        required_error: "Question count is required",
        invalid_type_error: "Count must be a number",
      })
      .int()
      .min(1, "Count must be at least 1")
      .max(50, "Count cannot exceed 50"),
  }),
});

export const submitQuizSchema = z.object({
  body: z.object({
    sessionId: z.string({
      required_error: "Session ID is required",
    }),
    answers: z.record(z.string(), z.string(), {
      required_error: "Answers are required",
    }),
  }),
});

export const getQuizResultSchema = z.object({
  params: z.object({
    sessionId: z.string({
      required_error: "Session ID is required",
    }),
  }),
});

// AI-powered validation schemas
export const generateAIQuestionsSchema = z.object({
  body: z.object({
    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(1, "Subject cannot be empty"),

    topic: z.string().optional(),

    questionType: z.nativeEnum(QuestionType, {
      required_error: "Question type is required",
    }),

    difficulty: z.nativeEnum(Difficulty, {
      required_error: "Difficulty is required",
    }),

    count: z
      .number({
        required_error: "Count is required",
      })
      .int()
      .min(1, "Count must be at least 1")
      .max(10, "Count cannot exceed 10"),
  }),
});

export const generateQuestionsByTopicsSchema = z.object({
  body: z.object({
    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(1, "Subject cannot be empty"),

    topics: z
      .array(z.string().min(1, "Topic cannot be empty"), {
        required_error: "Topics array is required",
      })
      .min(1, "At least one topic is required")
      .max(5, "Maximum 5 topics allowed"),

    difficulty: z.nativeEnum(Difficulty, {
      required_error: "Difficulty is required",
    }),
  }),
});

export const generateAdaptiveQuizSchema = z.object({
  body: z.object({
    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(1, "Subject cannot be empty"),
  }),
});

export const bulkGenerateQuestionsSchema = z.object({
  body: z.object({
    subjects: z
      .array(z.string().min(1, "Subject cannot be empty"), {
        required_error: "Subjects array is required",
      })
      .min(1, "At least one subject is required")
      .max(5, "Maximum 5 subjects allowed"),

    count: z
      .number()
      .int()
      .min(1, "Count must be at least 1")
      .max(10, "Count cannot exceed 10")
      .optional(),
  }),
});
