import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import * as focusSessionService from "../services/focus-session.service";
import * as studySessionService from "../services/study-session.service";
import * as subjectAnalyticsService from "../services/subject-analytics.service";
import * as subjectCrudService from "../services/subject-crud.service";

// Analytics Controllers
const getSubjectAnalytics = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { period } = req.query;

    const result = await subjectAnalyticsService.getSubjectAnalytics(
      userId,
      id,
      period as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subject analytics retrieved successfully",
      data: result,
    });
  }
);

const getTimeTracking = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { period, startDate, endDate, subjectId } = req.query;

    const result = await subjectAnalyticsService.getTimeTracking(
      userId,
      period as string,
      startDate as string,
      endDate as string,
      subjectId as string
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Time tracking data retrieved successfully",
      data: result,
    });
  }
);

// Dashboard Controllers
const getDashboardOverview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;

    // Get active subjects
    const activeSubjects = await subjectCrudService.getSubjects(
      userId,
      { isArchived: false },
      1,
      5
    );

    // Get today's study sessions
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todaySessions = await studySessionService.getStudySessions(
      userId,
      { startDate: todayStart.toISOString(), endDate: todayEnd.toISOString() },
      1,
      10
    );

    // Get active focus sessions
    const activeFocusSessions = await focusSessionService.getFocusSessions(
      userId,
      { status: "ACTIVE" },
      1,
      5
    );

    // Get upcoming exams
    const upcomingExams = await subjectCrudService.getSubjects(
      userId,
      { hasUpcomingExam: true, isArchived: false },
      1,
      5
    );

    // Calculate weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklyTimeTracking = await subjectAnalyticsService.getTimeTracking(
      userId,
      "week",
      weekStart.toISOString(),
      weekEnd.toISOString()
    );

    const dashboardData = {
      activeSubjects: activeSubjects.subjects,
      todaysSessions: todaySessions.sessions,
      activeFocusSessions: activeFocusSessions.sessions,
      upcomingExams: upcomingExams.subjects.filter((s: any) => s.nextExamDate),
      weeklyProgress: {
        totalHours: weeklyTimeTracking.weekly.totalHours,
        averagePerDay: weeklyTimeTracking.weekly.averagePerDay,
        mostStudiedSubject: weeklyTimeTracking.weekly.mostStudiedSubject,
      },
      stats: {
        totalSubjects: activeSubjects.pagination.total,
        todayHours:
          todaySessions.sessions.reduce(
            (sum: number, session: any) => sum + (session.duration || 0),
            0
          ) / 60,
        activeFocusSessionsCount: activeFocusSessions.pagination.total,
        upcomingExamsCount: upcomingExams.subjects.filter(
          (s: any) => s.nextExamDate
        ).length,
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard overview retrieved successfully",
      data: dashboardData,
    });
  }
);

const getSubjectProgress = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    // Get subject details
    const subject = await subjectCrudService.getSubjectById(userId, id);

    // Get weekly analytics
    const weeklyAnalytics = await subjectAnalyticsService.getSubjectAnalytics(
      userId,
      id,
      "week"
    );

    // Get recent sessions
    const recentSessions = await studySessionService.getStudySessions(
      userId,
      { subjectId: id },
      1,
      5
    );

    // Get recent focus sessions
    const recentFocusSessions = await focusSessionService.getFocusSessions(
      userId,
      { subjectId: id },
      1,
      5
    );

    const progressData = {
      subject,
      analytics: weeklyAnalytics,
      recentSessions: recentSessions.sessions,
      recentFocusSessions: recentFocusSessions.sessions,
      progressSummary: {
        totalHoursStudied: subject.totalHoursStudied,
        weeklyTarget: subject.targetHoursPerWeek || 0,
        weeklyActual: weeklyAnalytics.weeklyProgress.totalHours,
        weeklyProgress: weeklyAnalytics.weeklyProgress.progressPercentage,
        totalSessions: weeklyAnalytics.overallProgress.totalSessions,
        averageProductivity:
          weeklyAnalytics.overallProgress.averageProductivity,
      },
    };

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subject progress retrieved successfully",
      data: progressData,
    });
  }
);

export {
  getDashboardOverview,
  getSubjectAnalytics,
  getSubjectProgress,
  getTimeTracking,
};
