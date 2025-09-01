import { z } from "zod";
import { AnalyticsPeriod } from "./analytics.types";

export const getAnalyticsDashboardSchema = z.object({
  query: z.object({
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.MONTH),
    subjectId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const getLearningCurveSchema = z.object({
  query: z.object({
    subjectId: z.string({
      required_error: "Subject ID is required for learning curve analysis",
    }),
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.QUARTER),
    dataPoints: z.string().transform(Number).optional().default("20"),
  }),
});

export const getWeaknessAnalysisSchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    includeAiInsights: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
    minQuestionsRequired: z.string().transform(Number).optional().default("5"),
  }),
});

export const getStudyPatternsSchema = z.object({
  query: z.object({
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.MONTH),
    includeOptimization: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
    subjectFilter: z.string().optional(),
  }),
});

export const getPredictiveAnalysisSchema = z.object({
  query: z.object({
    examId: z.string().optional(),
    subjectId: z.string({
      required_error: "Subject ID is required for predictive analysis",
    }),
    examDate: z.string().datetime().optional(),
    currentPerformanceWeight: z
      .string()
      .transform(Number)
      .optional()
      .default("0.7"),
    includePreparationPlan: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});

export const getSubjectAnalyticsSchema = z.object({
  params: z.object({
    subjectId: z.string({
      required_error: "Subject ID is required",
    }),
  }),
  query: z.object({
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.MONTH),
    includeSpecialized: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(false),
    detailLevel: z
      .enum(["basic", "detailed", "comprehensive"])
      .optional()
      .default("detailed"),
  }),
});

export const getPerformanceComparisonSchema = z.object({
  query: z.object({
    subjectIds: z
      .string()
      .transform((val) => val.split(","))
      .optional(),
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.MONTH),
    includeGlobalBenchmark: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(false),
  }),
});

export const generateInsightsSchema = z.object({
  body: z.object({
    subjectId: z.string().optional(),
    analysisType: z
      .enum(["weakness", "strength", "improvement", "comprehensive"])
      .default("comprehensive"),
    includeRecommendations: z.boolean().optional().default(true),
    focusAreas: z.array(z.string()).optional(),
  }),
});

export const getStudyEfficiencySchema = z.object({
  query: z.object({
    period: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.MONTH),
    subjectId: z.string().optional(),
    includeTimeOptimization: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
    includeMethodComparison: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});

export const getAiInsightsSchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    insightType: z
      .enum(["performance", "learning_style", "recommendations", "all"])
      .optional()
      .default("all"),
    includeActionItems: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});

export const generateStudyPlanSchema = z.object({
  body: z.object({
    subjectId: z.string({
      required_error: "Subject ID is required for study plan generation",
    }),
    examDate: z.string().datetime({
      required_error: "Exam date is required",
    }),
    currentPerformanceLevel: z.number().min(0).max(100).optional(),
    targetScore: z.number().min(0).max(100).optional().default(85),
    availableStudyHours: z.number().min(1).max(100).optional(),
    priorities: z.array(z.string()).optional(),
  }),
});

export const getProgressTrackingSchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    trackingPeriod: z
      .nativeEnum(AnalyticsPeriod)
      .optional()
      .default(AnalyticsPeriod.WEEK),
    includeProjections: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
    compareWithGoals: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default(true),
  }),
});
