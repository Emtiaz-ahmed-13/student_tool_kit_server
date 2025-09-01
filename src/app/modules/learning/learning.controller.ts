import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import * as learningService from "./learning.service";
import {
  ILearningStreakFilters,
  IReadingMaterialFilters,
  IStudyReportFilters,
  IUploadedNoteFilters,
} from "./learning.types";

// Reading Material Controllers
const createReadingMaterial = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await learningService.createReadingMaterial(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Reading material uploaded successfully",
      data: result,
    });
  }
);

const getReadingMaterials = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters: IReadingMaterialFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await learningService.getReadingMaterials(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reading materials retrieved successfully",
      meta: result.pagination,
      data: result.materials,
    });
  }
);

const getReadingMaterial = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.getReadingMaterialById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reading material retrieved successfully",
      data: result,
    });
  }
);

const updateReadingMaterial = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.updateReadingMaterial(
      userId,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reading material updated successfully",
      data: result,
    });
  }
);

const deleteReadingMaterial = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.deleteReadingMaterial(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

const processWithAI = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    // Trigger AI processing (async)
    learningService.processReadingMaterialWithAI(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "AI processing started for reading material",
      data: { processingStatus: "started" },
    });
  }
);

// Study Report Controllers
const createStudyReport = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await learningService.createStudyReport(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Study report created successfully",
      data: result,
    });
  }
);

const getStudyReports = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters: IStudyReportFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await learningService.getStudyReports(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study reports retrieved successfully",
      meta: result.pagination,
      data: result.reports,
    });
  }
);

const getStudyReport = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.getStudyReportById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study report retrieved successfully",
      data: result,
    });
  }
);

// Generate report for a session (automatically triggered)
const generateSessionReport = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { sessionId, sessionType, readingMaterialIds, notesContent } =
      req.body;

    // This would be called automatically after a study/focus session
    const reportData = {
      type: (sessionType === "focus"
        ? "FOCUS_SESSION"
        : "STUDY_SESSION") as any,
      title: `${sessionType === "focus" ? "Focus" : "Study"} Session Report`,
      sessionDuration: 0, // This would come from the actual session
      sessionDate: new Date().toISOString(),
      studySessionId: sessionType === "study" ? sessionId : undefined,
      focusSessionId: sessionType === "focus" ? sessionId : undefined,
      readingMaterialId: readingMaterialIds?.[0],
    };

    const result = await learningService.createStudyReport(userId, reportData);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Session report generated successfully",
      data: result,
    });
  }
);

// Uploaded Notes Controllers
const createUploadedNote = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await learningService.createUploadedNote(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Note uploaded successfully and validation started",
      data: result,
    });
  }
);

const getUploadedNotes = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters: IUploadedNoteFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await learningService.getUploadedNotes(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Uploaded notes retrieved successfully",
      meta: result.pagination,
      data: result.notes,
    });
  }
);

const getUploadedNote = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.getUploadedNoteById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Uploaded note retrieved successfully",
      data: result,
    });
  }
);

const validateNotes = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    // Trigger AI validation (async)
    learningService.validateNotesWithAI(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notes validation started",
      data: { validationStatus: "started" },
    });
  }
);

// Learning Streak Controllers
const createLearningStreak = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await learningService.createLearningStreak(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Learning streak created successfully",
      data: result,
    });
  }
);

const getLearningStreaks = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters: ILearningStreakFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await learningService.getLearningStreaks(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Learning streaks retrieved successfully",
      meta: result.pagination,
      data: result.streaks,
    });
  }
);

const addStreakEntry = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await learningService.addStreakEntry(userId, id, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Streak entry added successfully",
      data: result,
    });
  }
);

// Learning Analytics and Dashboard Controllers
const getLearningDashboard = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { period } = req.query;

    const result = await learningService.getLearningDashboard(
      userId,
      period as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Learning dashboard retrieved successfully",
      data: result,
    });
  }
);

const getLearningAnalytics = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { period, subjectId, startDate, endDate } = req.query;

    // This would provide detailed analytics
    const result = {
      period: period || "month",
      totalStudyTime: 0,
      averageSessionDuration: 0,
      subjectBreakdown: [],
      performanceTrends: [],
      streakSummary: [],
      aiInsights: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Learning analytics retrieved successfully",
      data: result,
    });
  }
);

// Gamification Controllers
const getUserRanking = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;

    // This would calculate user's ranking based on streaks, study time, etc.
    const result = {
      globalRank: 1,
      totalUsers: 100,
      points: 1500,
      level: 8,
      nextLevelPoints: 1750,
      badges: [
        {
          name: "Study Warrior",
          description: "7-day study streak",
          earned: true,
        },
        {
          name: "Note Master",
          description: "50 validated notes",
          earned: true,
        },
        {
          name: "Focus Champion",
          description: "10 perfect focus sessions",
          earned: false,
        },
      ],
      achievements: [
        { title: "First Study Session", date: new Date(), points: 10 },
        { title: "7-Day Streak", date: new Date(), points: 50 },
      ],
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User ranking retrieved successfully",
      data: result,
    });
  }
);

const getLeaderboard = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { period, type } = req.query;

    // This would show top users by different metrics
    const result = {
      period: period || "week",
      type: type || "study_time",
      leaderboard: [
        { rank: 1, username: "StudyMaster", points: 2500, streak: 15 },
        { rank: 2, username: "FocusedLearner", points: 2200, streak: 12 },
        { rank: 3, username: "NoteNinja", points: 1800, streak: 8 },
      ],
      userPosition: {
        rank: 25,
        username: "CurrentUser",
        points: 1500,
        streak: 7,
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Leaderboard retrieved successfully",
      data: result,
    });
  }
);

// AI-Powered Features
const getStudyRecommendations = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;

    // AI-generated study recommendations based on user's learning patterns
    const result = {
      recommendations: [
        {
          type: "focus_improvement",
          title: "Improve Focus Sessions",
          description:
            "Your focus score has dropped in the last week. Try shorter sessions with more breaks.",
          priority: "high",
          actionItems: [
            "Use 25-minute Pomodoro sessions",
            "Eliminate distractions during study",
            "Take regular breaks",
          ],
        },
        {
          type: "subject_balance",
          title: "Balance Subject Study Time",
          description:
            "You're spending too much time on Mathematics. Consider more time for Physics.",
          priority: "medium",
          actionItems: [
            "Allocate 2 hours for Physics this week",
            "Review Physics notes from last session",
          ],
        },
      ],
      nextSession: {
        suggestedSubject: "Physics",
        suggestedDuration: 90,
        suggestedMode: "DEEP_WORK",
        materials: ["Chapter 5: Thermodynamics", "Practice Problems Set 3"],
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study recommendations retrieved successfully",
      data: result,
    });
  }
);

const getPersonalizedQuestions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { materialId, difficulty, count } = req.query;

    // Generate personalized questions based on user's reading materials and weak areas
    const result = {
      questions: [
        {
          id: "1",
          question: "What are the key principles of thermodynamics?",
          type: "short_answer",
          difficulty: "medium",
          topic: "Thermodynamics",
          aiGenerated: true,
        },
        {
          id: "2",
          question:
            "Which law states that energy cannot be created or destroyed?",
          type: "mcq",
          options: ["First Law", "Second Law", "Third Law", "Zeroth Law"],
          correctAnswer: "First Law",
          difficulty: "easy",
          topic: "Thermodynamics",
          aiGenerated: true,
        },
      ],
      basedOn: {
        readingMaterials: ["Thermodynamics Chapter"],
        weakAreas: ["Energy Conservation"],
        studyHistory: "Recent focus sessions",
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Personalized questions generated successfully",
      data: result,
    });
  }
);

export {
  addStreakEntry,
  // Learning Streaks
  createLearningStreak,
  // Reading Materials
  createReadingMaterial,
  // Study Reports
  createStudyReport,
  // Uploaded Notes
  createUploadedNote,
  deleteReadingMaterial,
  generateSessionReport,
  getLeaderboard,
  getLearningAnalytics,
  // Analytics and Dashboard
  getLearningDashboard,
  getLearningStreaks,
  getPersonalizedQuestions,
  getReadingMaterial,
  getReadingMaterials,
  // AI-Powered Features
  getStudyRecommendations,
  getStudyReport,
  getStudyReports,
  getUploadedNote,
  getUploadedNotes,
  // Gamification
  getUserRanking,
  processWithAI,
  updateReadingMaterial,
  validateNotes,
};
