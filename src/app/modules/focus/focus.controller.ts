import { Request, Response } from "express";
import ApiError from "../../errors/ApiError";
import sendResponse from "../../shared/sendResponse";
import { FocusService } from "./focus.service";
import { IFocusHabitCreate } from "./focus.types";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

export class FocusController {
  // GET /api/v1/focus/methods - Get famous focus methods
  static async getFocusMethods(req: AuthenticatedRequest, res: Response) {
    try {
      const { category, difficulty, subject, minDuration, maxDuration } =
        req.query;

      const methods = await FocusService.getFocusMethods({
        category: category as string,
        difficulty: difficulty as string,
        subject: subject as string,
        minDuration: minDuration ? parseInt(minDuration as string) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration as string) : undefined,
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Famous focus methods retrieved successfully",
        data: methods,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving focus methods: ${error}`);
    }
  }

  // GET /api/v1/focus/recommendations - Get personalized recommendations
  static async getFocusRecommendations(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { subject, currentLevel, goalType, availableTime } = req.query;

      const recommendations = await FocusService.getFocusRecommendations(
        userId,
        {
          subject: subject as string,
          currentLevel: currentLevel as string,
          goalType: goalType as string,
          availableTime: availableTime
            ? parseInt(availableTime as string)
            : undefined,
        }
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Personalized focus recommendations generated successfully",
        data: recommendations,
      });
    } catch (error) {
      throw new ApiError(500, `Error generating recommendations: ${error}`);
    }
  }

  // POST /api/v1/focus/habits - Create new focus habit
  static async createFocusHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const habitData: IFocusHabitCreate = req.body;
      const habit = await FocusService.createFocusHabit(userId, habitData);

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Focus habit created successfully",
        data: habit,
      });
    } catch (error) {
      throw new ApiError(500, `Error creating focus habit: ${error}`);
    }
  }

  // GET /api/v1/focus/habits - Get all user's focus habits
  static async getFocusHabits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { status, subjectId, page, limit, sortBy, order } = req.query;

      const result = await FocusService.getFocusHabits(userId, {
        status: status as any,
        subjectId: subjectId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as any,
        order: order as any,
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus habits retrieved successfully",
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving focus habits: ${error}`);
    }
  }

  // GET /api/v1/focus/habits/:id - Get specific focus habit
  static async getFocusHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { id } = req.params;
      const progress = await FocusService.getHabitProgress(userId, id);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus habit details retrieved successfully",
        data: progress,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving focus habit: ${error}`);
    }
  }

  // POST /api/v1/focus/habits/:habitId/sessions - Log habit session
  static async logHabitSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { habitId } = req.params;
      const sessionData = req.body;

      const session = await FocusService.logHabitSession(userId, habitId, {
        date: sessionData.date ? new Date(sessionData.date) : undefined,
        completed: sessionData.completed,
        effectiveness: sessionData.effectiveness,
        notes: sessionData.notes,
        completedSessions: sessionData.completedSessions || 1,
      });

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Habit session logged successfully",
        data: session,
      });
    } catch (error) {
      throw new ApiError(500, `Error logging habit session: ${error}`);
    }
  }

  // GET /api/v1/focus/habits/:habitId/progress - Get habit progress
  static async getHabitProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { habitId } = req.params;
      const { period } = req.query;

      const progress = await FocusService.getHabitProgress(
        userId,
        habitId,
        period as any
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Habit progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving habit progress: ${error}`);
    }
  }

  // GET /api/v1/focus/analytics - Get focus analytics
  static async getFocusAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { period, subjectId } = req.query;

      const analytics = await FocusService.getFocusAnalytics(userId, {
        period: period as any,
        subjectId: subjectId as string,
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving focus analytics: ${error}`);
    }
  }

  // PUT /api/v1/focus/habits/:id - Update focus habit
  static async updateFocusHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { id } = req.params;

      // For now, return a simple success response
      // TODO: Implement full update logic
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus habit updated successfully",
        data: { id, ...req.body },
      });
    } catch (error) {
      throw new ApiError(500, `Error updating focus habit: ${error}`);
    }
  }

  // DELETE /api/v1/focus/habits/:id - Delete focus habit
  static async deleteFocusHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { id } = req.params;

      // For now, return a simple success response
      // TODO: Implement full delete logic
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus habit deleted successfully",
        data: { id },
      });
    } catch (error) {
      throw new ApiError(500, `Error deleting focus habit: ${error}`);
    }
  }

  // POST /api/v1/focus/sessions/start - Start focus session
  static async startFocusSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const {
        methodId,
        subjectId,
        customDuration,
        customBreakDuration,
        notes,
        habitId,
      } = req.body;

      // Create a mock session response for now
      const session = {
        id: "session-" + Date.now(),
        methodId,
        subjectId,
        duration: customDuration || 25,
        breakDuration: customBreakDuration || 5,
        startTime: new Date(),
        status: "ACTIVE",
        userId,
        habitId,
        notes,
      };

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Focus session started successfully",
        data: session,
      });
    } catch (error) {
      throw new ApiError(500, `Error starting focus session: ${error}`);
    }
  }

  // PUT /api/v1/focus/sessions/:sessionId/complete - Complete focus session
  static async completeFocusSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { sessionId } = req.params;
      const { effectiveness, distractions, notes, completedFully } = req.body;

      // Create a mock completion response for now
      const completedSession = {
        id: sessionId,
        endTime: new Date(),
        effectiveness,
        distractions: distractions || 0,
        notes,
        completedFully,
        status: "COMPLETED",
      };

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Focus session completed successfully",
        data: completedSession,
      });
    } catch (error) {
      throw new ApiError(500, `Error completing focus session: ${error}`);
    }
  }

  // PUT /api/v1/focus/sessions/:sessionId/pause - Pause/Resume focus session
  static async pauseFocusSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const { sessionId } = req.params;
      const { action } = req.body;

      // Create a mock pause/resume response for now
      const updatedSession = {
        id: sessionId,
        status: action === "pause" ? "PAUSED" : "ACTIVE",
        pausedAt: action === "pause" ? new Date() : undefined,
        resumedAt: action === "resume" ? new Date() : undefined,
      };

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `Focus session ${action}d successfully`,
        data: updatedSession,
      });
    } catch (error) {
      throw new ApiError(
        500,
        `Error ${req.body.action}ing focus session: ${error}`
      );
    }
  }

  // POST /api/v1/focus/migrate - Migrate legacy focus sessions
  static async migrateLegacySessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const migrationResult = await FocusService.migrateLegacyFocusSessions(
        userId
      );

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Legacy focus sessions migration completed",
        data: migrationResult,
      });
    } catch (error) {
      throw new ApiError(500, `Error migrating legacy sessions: ${error}`);
    }
  }

  // GET /api/v1/focus/legacy-analytics - Get legacy session analytics
  static async getLegacyAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        throw new ApiError(401, "User authentication required");
      }

      const analytics = await FocusService.getLegacySessionAnalytics(userId);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Legacy session analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      throw new ApiError(500, `Error retrieving legacy analytics: ${error}`);
    }
  }
}

export default FocusController;
