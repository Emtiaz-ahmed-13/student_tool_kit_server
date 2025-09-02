import { PrismaClient } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import {
  FAMOUS_FOCUS_METHODS,
  FocusCategory,
  FocusMode,
  getLegacyModeMapping,
  HABIT_FORMATION_RULES,
  IFocusAnalytics,
  IFocusHabit,
  IFocusHabitCreate,
  IFocusHabitProgress,
  IFocusHabitSession,
  IFocusMethod,
  isLegacyFocusMode,
  SUBJECT_FOCUS_RECOMMENDATIONS,
} from "./focus.types";

const prisma = new PrismaClient();

export class FocusService {
  // Get all famous focus methods with filtering
  static async getFocusMethods(filters: {
    category?: string;
    difficulty?: string;
    subject?: string;
    minDuration?: number;
    maxDuration?: number;
  }): Promise<IFocusMethod[]> {
    let methods = [...FAMOUS_FOCUS_METHODS];

    // Filter by category
    if (filters.category) {
      methods = methods.filter(
        (method) => method.category === filters.category
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      methods = methods.filter(
        (method) => method.difficulty === filters.difficulty
      );
    }

    // Filter by subject recommendations
    if (filters.subject) {
      const subjectKey =
        filters.subject as keyof typeof SUBJECT_FOCUS_RECOMMENDATIONS;
      const recommendations = SUBJECT_FOCUS_RECOMMENDATIONS[subjectKey];
      if (recommendations) {
        methods = methods.filter((method) =>
          recommendations.recommendedMethods.includes(method.id)
        );
      }
    }

    // Filter by duration range
    if (filters.minDuration) {
      methods = methods.filter(
        (method) => method.focusDuration >= filters.minDuration!
      );
    }

    if (filters.maxDuration) {
      methods = methods.filter(
        (method) => method.focusDuration <= filters.maxDuration!
      );
    }

    return methods;
  }

  // Get personalized focus recommendations
  static async getFocusRecommendations(
    userId: string,
    options: {
      subject?: string;
      currentLevel?: string;
      goalType?: string;
      availableTime?: number;
    }
  ): Promise<{
    recommendedMethods: IFocusMethod[];
    habitFormationSuggestion: any;
    personalizedTips: string[];
    nextSteps: string[];
  }> {
    // Get user's focus history for personalization
    const userHabits = await prisma.focusHabit.findMany({
      where: { userId },
      include: {
        habitSessions: {
          take: 30,
          orderBy: { date: "desc" },
        },
      },
    });

    const userSessions = await prisma.focusSession.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    // Analyze user patterns
    const averageEffectiveness =
      userSessions.length > 0
        ? userSessions.reduce(
            (sum, session) => sum + (session.effectiveness || 5),
            0
          ) / userSessions.length
        : 5;

    const preferredDuration =
      userSessions.length > 0
        ? Math.round(
            userSessions.reduce(
              (sum, session) => sum + (session.actualDuration || 25),
              0
            ) / userSessions.length
          )
        : 25;

    // Get base recommendations
    let recommendedMethods = [...FAMOUS_FOCUS_METHODS];

    // Filter by subject if specified
    if (options.subject) {
      const subjectKey =
        options.subject as keyof typeof SUBJECT_FOCUS_RECOMMENDATIONS;
      const subjectRecs = SUBJECT_FOCUS_RECOMMENDATIONS[subjectKey];
      if (subjectRecs) {
        recommendedMethods = recommendedMethods.filter((method) =>
          subjectRecs.recommendedMethods.includes(method.id)
        );
      }
    }

    // Filter by available time
    if (options.availableTime) {
      recommendedMethods = recommendedMethods.filter(
        (method) => method.focusDuration <= options.availableTime!
      );
    }

    // Filter by current level
    if (options.currentLevel) {
      const levelOrder = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      const userLevel =
        levelOrder[options.currentLevel as keyof typeof levelOrder] || 0;
      recommendedMethods = recommendedMethods.filter((method) => {
        const methodLevel =
          levelOrder[method.difficulty as keyof typeof levelOrder];
        return methodLevel <= userLevel + 1; // Allow one level up
      });
    }

    // Prioritize based on goal type
    if (options.goalType === "habit_formation") {
      recommendedMethods = recommendedMethods.filter(
        (method) =>
          method.category === FocusCategory.HABIT_FORMATION ||
          method.difficulty === "Beginner"
      );
    } else if (options.goalType === "deep_learning") {
      recommendedMethods = recommendedMethods.filter(
        (method) =>
          method.category === FocusCategory.DEEP_WORK ||
          method.category === FocusCategory.SUBJECT_SPECIFIC
      );
    }

    // Take top 5 recommendations
    recommendedMethods = recommendedMethods.slice(0, 5);

    // Suggest habit formation approach
    const hasActiveHabits = userHabits.some((habit) => habit.isActive);
    let habitFormationSuggestion;

    if (!hasActiveHabits) {
      if (options.currentLevel === "Beginner") {
        habitFormationSuggestion = HABIT_FORMATION_RULES.RULE_21_DAYS;
      } else {
        habitFormationSuggestion = HABIT_FORMATION_RULES.RULE_66_DAYS;
      }
    } else {
      habitFormationSuggestion = {
        name: "Continue Current Habits",
        description: "You have active habits - keep building on them!",
        advice:
          "Focus on consistency with your current habits before starting new ones.",
      };
    }

    // Generate personalized tips
    const personalizedTips = this.generatePersonalizedTips(
      averageEffectiveness,
      preferredDuration,
      userHabits.length,
      options.subject
    );

    // Generate next steps
    const nextSteps = this.generateNextSteps(
      userHabits,
      averageEffectiveness,
      options.goalType
    );

    return {
      recommendedMethods,
      habitFormationSuggestion,
      personalizedTips,
      nextSteps,
    };
  }

  // Create a new focus habit (21-day, 66-day, etc.)
  static async createFocusHabit(
    userId: string,
    habitData: IFocusHabitCreate
  ): Promise<IFocusHabit> {
    // Get default durations for the selected method
    const methodConfig = this.getMethodConfiguration(habitData.focusMode);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + habitData.targetDays);

    const habit = await prisma.focusHabit.create({
      data: {
        name: habitData.name,
        focusMode: habitData.focusMode,
        targetDays: habitData.targetDays,
        focusDuration: habitData.focusDuration || methodConfig.focusDuration,
        breakDuration: habitData.breakDuration || methodConfig.breakDuration,
        sessionsPerDay: habitData.sessionsPerDay || 1,
        targetDate,
        userId,
        subjectId: habitData.subjectId,
      },
      include: {
        subject: {
          select: { name: true, color: true },
        },
      },
    });

    return habit as any;
  }

  // Log a habit session (daily progress)
  static async logHabitSession(
    userId: string,
    habitId: string,
    sessionData: {
      date?: Date;
      completed: boolean;
      effectiveness?: number;
      notes?: string;
      completedSessions: number;
    }
  ): Promise<IFocusHabitSession> {
    const sessionDate = sessionData.date || new Date();
    sessionDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if session already exists for this date
    const existingSession = await prisma.focusHabitSession.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: sessionDate,
        },
      },
    });

    let session;
    if (existingSession) {
      // Update existing session
      session = await prisma.focusHabitSession.update({
        where: { id: existingSession.id },
        data: {
          completed: sessionData.completed,
          effectiveness: sessionData.effectiveness,
          notes: sessionData.notes,
          completedSessions: sessionData.completedSessions,
        },
      });
    } else {
      // Create new session
      const habit = await prisma.focusHabit.findUnique({
        where: { id: habitId },
      });

      if (!habit) {
        throw new ApiError(404, "Focus habit not found");
      }

      session = await prisma.focusHabitSession.create({
        data: {
          date: sessionDate,
          completed: sessionData.completed,
          effectiveness: sessionData.effectiveness,
          notes: sessionData.notes,
          plannedSessions: habit.sessionsPerDay,
          completedSessions: sessionData.completedSessions,
          habitId,
          userId,
        },
      });
    }

    // Update habit progress
    await this.updateHabitProgress(habitId);

    return session as any;
  }

  // Get habit progress and analytics
  static async getHabitProgress(
    userId: string,
    habitId: string,
    period: "week" | "month" | "all" = "month"
  ): Promise<IFocusHabitProgress> {
    const habit = await prisma.focusHabit.findFirst({
      where: { id: habitId, userId },
      include: {
        habitSessions: {
          orderBy: { date: "desc" },
          take: period === "week" ? 7 : period === "month" ? 30 : undefined,
        },
        subject: {
          select: { name: true },
        },
      },
    });

    if (!habit) {
      throw new ApiError(404, "Focus habit not found");
    }

    const progressPercentage = (habit.completedDays / habit.targetDays) * 100;
    const daysRemaining = Math.max(0, habit.targetDays - habit.completedDays);

    // Calculate if on track
    const daysSinceStart = Math.floor(
      (Date.now() - habit.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const expectedProgress = Math.min(
      100,
      (daysSinceStart / habit.targetDays) * 100
    );
    const isOnTrack = progressPercentage >= expectedProgress * 0.8; // 80% tolerance

    // Generate motivation
    const motivation = this.generateMotivation(
      habit.currentStreak,
      progressPercentage,
      isOnTrack
    );

    // Calculate next milestone
    const nextMilestone = this.calculateNextMilestone(
      habit.completedDays,
      habit.targetDays
    );

    return {
      habitId: habit.id,
      habitName: habit.name,
      currentStreak: habit.currentStreak,
      targetDays: habit.targetDays,
      progressPercentage: Math.round(progressPercentage),
      daysRemaining,
      isOnTrack,
      motivation,
      nextMilestone,
    };
  }

  // Get comprehensive focus analytics
  static async getFocusAnalytics(
    userId: string,
    options: {
      period?: "week" | "month" | "quarter" | "year";
      subjectId?: string;
    } = {}
  ): Promise<IFocusAnalytics> {
    const { period = "month", subjectId } = options;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get habits data
    const habits = await prisma.focusHabit.findMany({
      where: {
        userId,
        ...(subjectId && { subjectId }),
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        habitSessions: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
        },
        subject: {
          select: { name: true },
        },
      },
    });

    const totalHabits = habits.length;
    const activeHabits = habits.filter((h) => h.isActive).length;
    const completedHabits = habits.filter((h) => h.completedDate).length;

    const averageStreakLength =
      habits.length > 0
        ? habits.reduce((sum, h) => sum + h.longestStreak, 0) / habits.length
        : 0;

    // Find most successful method
    const methodCounts = habits.reduce((acc, habit) => {
      acc[habit.focusMode] = (acc[habit.focusMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostSuccessfulMethod =
      Object.entries(methodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "None";

    // Generate weekly progress
    const weeklyProgress = this.generateWeeklyProgress(
      habits,
      startDate,
      endDate
    );

    // Generate subject performance
    const subjectPerformance = this.generateSubjectPerformance(habits);

    return {
      totalHabits,
      activeHabits,
      completedHabits,
      averageStreakLength: Math.round(averageStreakLength),
      mostSuccessfulMethod,
      optimalSessionTime: this.calculateOptimalSessionTime(habits),
      weeklyProgress,
      subjectPerformance,
    };
  }

  // Get all user's focus habits
  static async getFocusHabits(
    userId: string,
    filters: {
      status?: "active" | "completed" | "paused" | "all";
      subjectId?: string;
      page?: number;
      limit?: number;
      sortBy?: "name" | "progress" | "streak" | "created";
      order?: "asc" | "desc";
    } = {}
  ) {
    const {
      status = "active",
      subjectId,
      page = 1,
      limit = 10,
      sortBy = "created",
      order = "desc",
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (status !== "all") {
      if (status === "active") {
        where.isActive = true;
        where.completedDate = null;
      } else if (status === "completed") {
        where.completedDate = { not: null };
      } else if (status === "paused") {
        where.isActive = false;
        where.completedDate = null;
      }
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy.name = order;
        break;
      case "progress":
        orderBy.completedDays = order;
        break;
      case "streak":
        orderBy.currentStreak = order;
        break;
      default:
        orderBy.createdAt = order;
    }

    const [habits, total] = await Promise.all([
      prisma.focusHabit.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          subject: {
            select: { name: true, color: true },
          },
          habitSessions: {
            take: 7,
            orderBy: { date: "desc" },
          },
        },
      }),
      prisma.focusHabit.count({ where }),
    ]);

    return {
      data: habits,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Helper methods
  private static getMethodConfiguration(focusMode: FocusMode) {
    // Handle legacy modes first
    if (isLegacyFocusMode(focusMode)) {
      const legacyMapping = getLegacyModeMapping(focusMode);
      if (legacyMapping.method) {
        return {
          focusDuration: legacyMapping.method.focusDuration,
          breakDuration: legacyMapping.method.breakDuration,
        };
      }
      // Fallback for legacy modes without mapping
      switch (focusMode) {
        case FocusMode.POMODORO:
          return { focusDuration: 25, breakDuration: 5 };
        case FocusMode.DEEP_WORK:
          return { focusDuration: 90, breakDuration: 20 };
        case FocusMode.MARATHON:
          return { focusDuration: 120, breakDuration: 30 };
        default:
          return { focusDuration: 25, breakDuration: 5 };
      }
    }

    // Handle new enhanced methods
    const method = FAMOUS_FOCUS_METHODS.find((m) => m.id === focusMode);
    return method
      ? {
          focusDuration: method.focusDuration,
          breakDuration: method.breakDuration,
        }
      : {
          focusDuration: 25,
          breakDuration: 5,
        };
  }

  private static async updateHabitProgress(habitId: string) {
    const habit = await prisma.focusHabit.findUnique({
      where: { id: habitId },
      include: {
        habitSessions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!habit) return;

    const completedSessions = habit.habitSessions.filter((s) => s.completed);
    const completedDays = completedSessions.length;

    // Calculate current streak
    let currentStreak = 0;
    const sortedSessions = habit.habitSessions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    for (const session of sortedSessions) {
      if (session.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate average effectiveness
    const effectiveSessions = completedSessions.filter((s) => s.effectiveness);
    const averageEffectiveness =
      effectiveSessions.length > 0
        ? effectiveSessions.reduce(
            (sum, s) => sum + (s.effectiveness || 0),
            0
          ) / effectiveSessions.length
        : undefined;

    // Check if habit is completed
    const isCompleted = completedDays >= habit.targetDays;
    const completedDate =
      isCompleted && !habit.completedDate ? new Date() : habit.completedDate;

    await prisma.focusHabit.update({
      where: { id: habitId },
      data: {
        completedDays,
        currentStreak,
        longestStreak: Math.max(habit.longestStreak, currentStreak),
        totalSessions: habit.habitSessions.reduce(
          (sum, s) => sum + s.completedSessions,
          0
        ),
        averageEffectiveness,
        completedDate,
        isActive: !isCompleted,
      },
    });
  }

  private static generatePersonalizedTips(
    averageEffectiveness: number,
    preferredDuration: number,
    habitsCount: number,
    subject?: string
  ): string[] {
    const tips: string[] = [];

    if (averageEffectiveness < 6) {
      tips.push("Consider shorter sessions to improve focus quality");
      tips.push("Try meditation-based methods to enhance concentration");
    } else if (averageEffectiveness > 8) {
      tips.push(
        "Great focus! Consider challenging yourself with longer sessions"
      );
      tips.push("You might be ready for advanced deep work methods");
    }

    if (preferredDuration < 25) {
      tips.push("Short bursts work for you - try Pomodoro variations");
    } else if (preferredDuration > 60) {
      tips.push("You excel at long sessions - deep work methods suit you");
    }

    if (habitsCount === 0) {
      tips.push("Start with the 21-day rule for simple habit formation");
    } else if (habitsCount > 3) {
      tips.push("Focus on maintaining current habits before adding new ones");
    }

    if (subject) {
      const subjectKey = subject as keyof typeof SUBJECT_FOCUS_RECOMMENDATIONS;
      const subjectRec = SUBJECT_FOCUS_RECOMMENDATIONS[subjectKey];
      if (subjectRec) {
        tips.push(subjectRec.reasoning);
      }
    }

    return tips;
  }

  private static generateNextSteps(
    userHabits: any[],
    averageEffectiveness: number,
    goalType?: string
  ): string[] {
    const steps: string[] = [];

    if (userHabits.length === 0) {
      steps.push(
        "Create your first focus habit with a beginner-friendly method"
      );
      steps.push("Start with 21-day commitment for easier success");
    } else {
      const activeHabits = userHabits.filter((h) => h.isActive).length;
      if (activeHabits === 0) {
        steps.push("Restart an existing habit or create a new one");
      } else if (activeHabits > 2) {
        steps.push("Focus on consistency with current habits");
      } else {
        steps.push("Consider adding one more complementary habit");
      }
    }

    if (averageEffectiveness < 7) {
      steps.push(
        "Experiment with different focus methods to find your optimal approach"
      );
    }

    if (goalType === "exam_prep") {
      steps.push("Implement active recall sessions for better retention");
      steps.push("Use Feynman technique blocks for complex concepts");
    }

    return steps;
  }

  private static generateMotivation(
    currentStreak: number,
    progressPercentage: number,
    isOnTrack: boolean
  ) {
    let level: "Low" | "Medium" | "High" = "Medium";
    let message = "";
    const tips: string[] = [];

    if (currentStreak >= 7) {
      level = "High";
      message = `Amazing! ${currentStreak} days streak - you're building real momentum!`;
      tips.push("Keep the momentum going - you're in the zone!");
    } else if (currentStreak >= 3) {
      level = "Medium";
      message = `Good job! ${currentStreak} days streak - keep it going!`;
      tips.push("You're building momentum - don't break the chain!");
    } else {
      level = "Low";
      message = "Every day counts - start your streak today!";
      tips.push(
        "Focus on just getting started - that's often the hardest part"
      );
    }

    if (!isOnTrack) {
      tips.push(
        "Don't worry about being behind - consistency matters more than perfection"
      );
      tips.push(
        "Consider reducing session difficulty to make it easier to maintain"
      );
    }

    if (progressPercentage > 80) {
      tips.push("You're almost there! The finish line is in sight!");
    }

    return { level, message, tips };
  }

  private static calculateNextMilestone(
    completedDays: number,
    targetDays: number
  ) {
    const milestones = [7, 14, 21, 30, 50, 66, 100];
    const nextMilestone =
      milestones.find((m) => m > completedDays) || targetDays;

    const rewards = {
      7: "One week warrior! 🎯",
      14: "Two weeks strong! 💪",
      21: "Habit foundation built! 🏗️",
      30: "Monthly champion! 🏆",
      50: "Halfway hero! ⭐",
      66: "Habit master! 👑",
      100: "Century achiever! 🎉",
    };

    return {
      day: nextMilestone,
      reward:
        rewards[nextMilestone as keyof typeof rewards] || "Habit completed! 🎊",
    };
  }

  private static generateWeeklyProgress(
    habits: any[],
    startDate: Date,
    endDate: Date
  ) {
    // Implementation for weekly progress calculation
    return [];
  }

  private static generateSubjectPerformance(habits: any[]) {
    // Group by subject and calculate performance metrics
    return [];
  }

  private static calculateOptimalSessionTime(habits: any[]): string {
    if (habits.length === 0) return "Not enough data";

    const avgDuration =
      habits.reduce((sum, h) => sum + h.focusDuration, 0) / habits.length;
    return `${Math.round(avgDuration)} minutes`;
  }

  // Legacy Data Migration Support
  static async migrateLegacyFocusSessions(userId: string): Promise<{
    migrated: number;
    skipped: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migrated = 0;
    let skipped = 0;

    try {
      // Get all focus sessions with legacy modes
      const legacySessions = await prisma.focusSession.findMany({
        where: {
          userId,
          mode: {
            in: [
              FocusMode.POMODORO,
              FocusMode.DEEP_WORK,
              FocusMode.CUSTOM,
              FocusMode.MARATHON,
            ],
          },
        },
      });

      for (const session of legacySessions) {
        try {
          if (isLegacyFocusMode(session.mode as any)) {
            const mapping = getLegacyModeMapping(session.mode as any);

            // Create a focus habit suggestion based on legacy usage
            const habitName = `Migrated ${session.mode} Sessions`;
            const existingHabit = await prisma.focusHabit.findFirst({
              where: {
                userId,
                name: habitName,
              },
            });

            if (
              !existingHabit &&
              session.effectiveness &&
              session.effectiveness >= 7
            ) {
              // Create a habit for effective legacy sessions
              await this.createFocusHabit(userId, {
                name: habitName,
                focusMode: mapping.enhanced,
                targetDays: 21, // Start with 21-day rule
                subjectId: session.subjectId || undefined,
              });
              migrated++;
            } else {
              skipped++;
            }
          }
        } catch (error) {
          errors.push(`Error migrating session ${session.id}: ${error}`);
        }
      }

      return { migrated, skipped, errors };
    } catch (error) {
      throw new ApiError(500, `Migration failed: ${error}`);
    }
  }

  // Get legacy focus session analytics
  static async getLegacySessionAnalytics(userId: string): Promise<{
    totalLegacySessions: number;
    legacyModeDistribution: Record<string, number>;
    migrationSuggestions: {
      mode: FocusMode;
      enhancedMode: FocusMode;
      sessionsCount: number;
      averageEffectiveness: number;
      recommendedHabit: string;
    }[];
  }> {
    const legacySessions = await prisma.focusSession.findMany({
      where: {
        userId,
        mode: {
          in: [
            FocusMode.POMODORO,
            FocusMode.DEEP_WORK,
            FocusMode.CUSTOM,
            FocusMode.MARATHON,
          ],
        },
      },
      include: {
        subject: {
          select: { name: true },
        },
      },
    });

    const modeDistribution: Record<string, number> = {};
    const modeEffectiveness: Record<string, number[]> = {};

    legacySessions.forEach((session) => {
      const mode = session.mode;
      modeDistribution[mode] = (modeDistribution[mode] || 0) + 1;

      if (session.effectiveness) {
        if (!modeEffectiveness[mode]) {
          modeEffectiveness[mode] = [];
        }
        modeEffectiveness[mode].push(session.effectiveness);
      }
    });

    const migrationSuggestions = Object.entries(modeDistribution).map(
      ([mode, count]) => {
        const legacyMode = mode as FocusMode;
        const mapping = getLegacyModeMapping(legacyMode);
        const effectiveness = modeEffectiveness[mode] || [];
        const avgEffectiveness =
          effectiveness.length > 0
            ? effectiveness.reduce((sum, eff) => sum + eff, 0) /
              effectiveness.length
            : 0;

        let recommendedHabit = "Try the 21-day habit formation";
        if (avgEffectiveness >= 8) {
          recommendedHabit = "Perfect for 66-day habit mastery";
        } else if (avgEffectiveness >= 6) {
          recommendedHabit = "Good candidate for 30-day challenge";
        }

        return {
          mode: legacyMode,
          enhancedMode: mapping.enhanced,
          sessionsCount: count,
          averageEffectiveness: Math.round(avgEffectiveness * 10) / 10,
          recommendedHabit,
        };
      }
    );

    return {
      totalLegacySessions: legacySessions.length,
      legacyModeDistribution: modeDistribution,
      migrationSuggestions,
    };
  }
}

export default FocusService;
