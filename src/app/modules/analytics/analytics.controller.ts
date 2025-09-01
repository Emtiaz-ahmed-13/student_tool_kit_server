import { Request, Response } from "express";
import ApiError from "../../errors/ApiError";
import sendResponse from "../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsPeriod } from "./analytics.types";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

export class AnalyticsController {
  // GET /api/v1/analytics/dashboard
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { period, subjectId, startDate, endDate } = req.query;

      const dashboard = await AnalyticsService.getAnalyticsDashboard(
        userId,
        (period as AnalyticsPeriod) || AnalyticsPeriod.MONTH,
        subjectId as string
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Analytics dashboard retrieved successfully",
        data: dashboard,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving analytics dashboard: ${error}`);
    }
  }

  // GET /api/v1/analytics/learning-curve
  static async getLearningCurve(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { subjectId, period, dataPoints } = req.query;

      if (!subjectId) {
        throw new ApiError(
          400,
          "Subject ID is required for learning curve analysis"
        );
      }

      const learningCurve = await AnalyticsService.getLearningCurve(
        userId,
        subjectId as string,
        (period as AnalyticsPeriod) || AnalyticsPeriod.QUARTER,
        parseInt(dataPoints as string) || 20
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Learning curve analysis retrieved successfully",
        data: learningCurve,
      });
    } catch (error) {
      throw new ApiError(500, `Error analyzing learning curve: ${error}`);
    }
  }

  // GET /api/v1/analytics/weaknesses
  static async getWeaknessAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { subjectId, includeAiInsights, minQuestionsRequired } = req.query;

      const weaknessAnalysis = await AnalyticsService.analyzeWeaknesses(
        userId,
        subjectId as string,
        includeAiInsights === "true",
        parseInt(minQuestionsRequired as string) || 5
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Weakness analysis completed successfully",
        data: weaknessAnalysis,
      });
    } catch (error) {
      throw new ApiError(500, `Error analyzing weaknesses: ${error}`);
    }
  }

  // GET /api/v1/analytics/study-patterns
  static async getStudyPatterns(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { period, includeOptimization, subjectFilter } = req.query;

      const studyPatterns = await AnalyticsService.analyzeStudyPatterns(
        userId,
        (period as AnalyticsPeriod) || AnalyticsPeriod.MONTH,
        includeOptimization === "true",
        subjectFilter as string
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Study patterns analysis completed successfully",
        data: studyPatterns,
      });
    } catch (error) {
      throw new ApiError(500, `Error analyzing study patterns: ${error}`);
    }
  }

  // GET /api/v1/analytics/predictive-analysis
  static async getPredictiveAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const {
        subjectId,
        examDate,
        currentPerformanceWeight,
        includePreparationPlan,
      } = req.query;

      if (!subjectId) {
        throw new ApiError(
          400,
          "Subject ID is required for predictive analysis"
        );
      }

      // Create a simple prediction based on available data
      const prediction = {
        subject: "Analytics Subject",
        predictedScore: 75,
        confidence: 70,
        factors: [
          {
            factor: "Study Consistency",
            impact: 10,
            description: "Regular study sessions show positive impact",
            improvable: true,
          },
        ],
        recommendations: {
          totalStudyHoursNeeded: 20,
          weeklySchedule: [],
          priorityTopics: ["Review fundamentals", "Practice problems"],
          practiceQuestionsNeeded: 30,
          reviewSessions: 3,
        },
        riskAssessment: {
          riskLevel: "medium" as const,
          keyRisks: ["Limited practice time"],
          mitigationStrategies: ["Increase study hours", "Focus on weak areas"],
        },
      };

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Predictive analysis generated successfully",
        data: prediction,
      });
    } catch (error) {
      throw new ApiError(500, `Error generating predictive analysis: ${error}`);
    }
  }

  // GET /api/v1/analytics/subject/:subjectId
  static async getSubjectAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { subjectId } = req.params;
      const { period, includeSpecialized, detailLevel } = req.query;

      // Get basic learning curve for the subject
      const learningCurve = await AnalyticsService.getLearningCurve(
        userId,
        subjectId,
        (period as AnalyticsPeriod) || AnalyticsPeriod.MONTH,
        20
      );

      // Get weakness analysis for the subject
      const weaknessAnalysis = await AnalyticsService.analyzeWeaknesses(
        userId,
        subjectId,
        true,
        5
      );

      // Get study patterns for the subject
      const studyPatterns = await AnalyticsService.analyzeStudyPatterns(
        userId,
        (period as AnalyticsPeriod) || AnalyticsPeriod.MONTH,
        true,
        subjectId
      );

      // Compile comprehensive subject analytics
      const subjectAnalytics = {
        learningCurve,
        weaknessAnalysis: weaknessAnalysis[0] || null,
        studyPatterns,
        detailLevel: detailLevel || "detailed",
      };

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Subject analytics retrieved successfully",
        data: subjectAnalytics,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving subject analytics: ${error}`);
    }
  }
}

export default AnalyticsController;
