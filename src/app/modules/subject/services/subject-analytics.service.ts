import prisma from "../../../shared/prisma";
import { ISubjectAnalytics, ITimeTracking } from "../subject.types";
import { getSubjectById } from "./subject-crud.service";

// Analytics and Reporting Operations
const getSubjectAnalytics = async (
  userId: string,
  subjectId: string,
  period = "week"
) => {
  const subject = await getSubjectById(userId, subjectId);

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "semester":
      startDate =
        subject.semesterStart ||
        new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const [sessions, weeklyHours] = await Promise.all([
    prisma.studySession.findMany({
      where: {
        subjectId,
        startTime: { gte: startDate },
      },
      orderBy: { startTime: "asc" },
    }),
    getWeeklyHours(userId, subjectId),
  ]);

  // Calculate analytics
  const totalHours =
    sessions.reduce(
      (sum: number, session: any) => sum + (session.duration || 0),
      0
    ) / 60;
  const averageSessionDuration =
    sessions.length > 0 ? totalHours / sessions.length : 0;
  const averageProductivity =
    sessions.length > 0
      ? sessions.reduce(
          (sum: number, session: any) => sum + (session.productivity || 0),
          0
        ) / sessions.length
      : 0;

  // Daily breakdown
  const dailyBreakdown = getDailyBreakdown(sessions, startDate, now);

  // Weekly progress
  const targetHours = subject.targetHoursPerWeek || 0;
  const progressPercentage =
    targetHours > 0 ? (weeklyHours / targetHours) * 100 : 0;

  // Upcoming events
  const upcomingEvents = [];
  if (subject.nextExamDate && subject.nextExamDate > now) {
    upcomingEvents.push({
      type: "exam" as const,
      date: subject.nextExamDate,
      description: `${subject.examType || "Exam"} - ${subject.name}`,
    });
  }

  const analytics: ISubjectAnalytics = {
    subject: subject as any,
    weeklyProgress: {
      totalHours: weeklyHours,
      targetHours,
      progressPercentage,
      dailyBreakdown,
    },
    overallProgress: {
      totalHoursStudied: subject.totalHoursStudied,
      averageSessionDuration,
      totalSessions: sessions.length,
      averageProductivity,
    },
    upcomingEvents,
  };

  return analytics;
};

const getTimeTracking = async (
  userId: string,
  period = "week",
  startDate?: string,
  endDate?: string,
  subjectId?: string
) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (period) {
      case "day":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "week":
        const weekStart = now.getDate() - now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), weekStart);
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
    }
  }

  const where: any = {
    userId,
    startTime: { gte: start, lte: end },
  };

  if (subjectId) {
    await getSubjectById(userId, subjectId);
    where.subjectId = subjectId;
  }

  const sessions = await prisma.studySession.findMany({
    where,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return generateTimeTrackingReport(sessions, start, end, period);
};

// Helper functions
const getWeeklyHours = async (
  userId: string,
  subjectId: string
): Promise<number> => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      subjectId,
      startTime: { gte: oneWeekAgo },
    },
  });

  return (
    sessions.reduce(
      (total: number, session: any) => total + (session.duration || 0),
      0
    ) / 60
  );
};

const getDailyBreakdown = (sessions: any[], startDate: Date, endDate: Date) => {
  const days: any[] = [];
  const currentDate = new Date(startDate);

  while (currentDate < endDate) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const daySessions = sessions.filter(
      (session) => session.startTime >= dayStart && session.startTime < dayEnd
    );

    const totalHours =
      daySessions.reduce((sum, session) => sum + (session.duration || 0), 0) /
      60;

    days.push({
      date: currentDate.toISOString().split("T")[0],
      hours: totalHours,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

const generateTimeTrackingReport = (
  sessions: any[],
  startDate: Date,
  endDate: Date,
  period: string
): ITimeTracking => {
  const totalHours =
    sessions.reduce(
      (sum: number, session: any) => sum + (session.duration || 0),
      0
    ) / 60;

  // Daily breakdown
  const daily = getDailyBreakdown(sessions, startDate, endDate).map(
    (day: any) => {
      const daySessions = sessions.filter(
        (session: any) =>
          session.startTime.toISOString().split("T")[0] === day.date
      );

      const subjectHours = daySessions.reduce((acc: any, session: any) => {
        const subjectId = session.subject.id;
        if (!acc[subjectId]) {
          acc[subjectId] = {
            subjectId,
            subjectName: session.subject.name,
            hours: 0,
            color: session.subject.color,
          };
        }
        acc[subjectId].hours += (session.duration || 0) / 60;
        return acc;
      }, {});

      return {
        date: day.date,
        totalHours: day.hours,
        sessions: daySessions.length,
        subjects: Object.values(subjectHours) as any[],
      };
    }
  );

  // Calculate weekly and monthly stats
  const daysInPeriod = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const averagePerDay = totalHours / daysInPeriod;

  // Subject breakdown
  const subjectHours = sessions.reduce((acc: any, session: any) => {
    const subjectId = session.subject.id;
    if (!acc[subjectId]) {
      acc[subjectId] = {
        id: subjectId,
        name: session.subject.name,
        hours: 0,
      };
    }
    acc[subjectId].hours += (session.duration || 0) / 60;
    return acc;
  }, {});

  const subjectArray = Object.values(subjectHours) as any[];
  const mostStudiedSubject = subjectArray.reduce(
    (max: any, subject: any) => (subject.hours > max.hours ? subject : max),
    subjectArray[0] || { id: "", name: "", hours: 0 }
  );
  const leastStudiedSubject = subjectArray.reduce(
    (min: any, subject: any) => (subject.hours < min.hours ? subject : min),
    subjectArray[0] || { id: "", name: "", hours: 0 }
  );

  return {
    daily,
    weekly: {
      totalHours,
      averagePerDay,
      mostStudiedSubject,
      leastStudiedSubject,
    },
    monthly: {
      totalHours,
      averagePerWeek: totalHours / (daysInPeriod / 7),
      progressTrend: "stable" as const,
      monthlyGoalProgress: 0,
    },
  };
};

export {
  generateTimeTrackingReport,
  getDailyBreakdown,
  getSubjectAnalytics,
  getTimeTracking,
  getWeeklyHours,
};
