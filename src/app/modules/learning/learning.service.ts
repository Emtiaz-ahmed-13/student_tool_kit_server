import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import learningAIService from "./learning-ai.service";
import {
  ILearningDashboard,
  ILearningStreakCreate,
  ILearningStreakFilters,
  IReadingMaterialCreate,
  IReadingMaterialFilters,
  IReadingMaterialUpdate,
  IStreakEntryCreate,
  IStudyReportCreate,
  IStudyReportFilters,
  IUploadedNoteCreate,
  IUploadedNoteFilters,
  StreakType,
  UploadStatus,
  ValidationStatus,
} from "./learning.types";

// Reading Material Management
const createReadingMaterial = async (
  userId: string,
  payload: IReadingMaterialCreate
) => {
  const materialData = {
    ...payload,
    userId,
    uploadStatus: UploadStatus.PENDING,
  };

  const newMaterial = await prisma.readingMaterial.create({
    data: materialData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // If file URL is provided, process with AI
  if (payload.fileUrl) {
    processReadingMaterialWithAI(newMaterial.id, userId);
  }

  return newMaterial;
};

const getReadingMaterials = async (
  userId: string,
  filters: IReadingMaterialFilters,
  page = 1,
  limit = 10
) => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }

  if (filters.uploadStatus) {
    where.uploadStatus = filters.uploadStatus;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  if (filters.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [materials, total] = await Promise.all([
    prisma.readingMaterial.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            studyReports: true,
            uploadedNotes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.readingMaterial.count({ where }),
  ]);

  return {
    materials,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getReadingMaterialById = async (userId: string, materialId: string) => {
  const material = await prisma.readingMaterial.findFirst({
    where: {
      id: materialId,
      userId,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      studyReports: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      uploadedNotes: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!material) {
    throw new ApiError(404, "Reading material not found");
  }

  return material;
};

const updateReadingMaterial = async (
  userId: string,
  materialId: string,
  payload: IReadingMaterialUpdate
) => {
  const material = await getReadingMaterialById(userId, materialId);

  const updatedMaterial = await prisma.readingMaterial.update({
    where: { id: materialId },
    data: payload,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return updatedMaterial;
};

const deleteReadingMaterial = async (userId: string, materialId: string) => {
  await getReadingMaterialById(userId, materialId);

  await prisma.readingMaterial.delete({
    where: { id: materialId },
  });

  return { message: "Reading material deleted successfully" };
};

// AI Processing for Reading Materials
const processReadingMaterialWithAI = async (
  materialId: string,
  userId: string
) => {
  try {
    await prisma.readingMaterial.update({
      where: { id: materialId },
      data: { uploadStatus: UploadStatus.PROCESSING },
    });

    const material = await prisma.readingMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material || !material.extractedText) {
      throw new Error("No content to process");
    }

    const aiAnalysis = await learningAIService.extractTopicsFromContent(
      material.extractedText,
      material.title
    );

    await prisma.readingMaterial.update({
      where: { id: materialId },
      data: {
        topics: aiAnalysis.topics,
        keyPoints: aiAnalysis.keyPoints,
        difficulty: aiAnalysis.difficulty,
        estimatedReadTime: aiAnalysis.estimatedReadTime,
        uploadStatus: UploadStatus.COMPLETED,
      },
    });
  } catch (error) {
    console.error("Error processing reading material with AI:", error);

    await prisma.readingMaterial.update({
      where: { id: materialId },
      data: {
        uploadStatus: UploadStatus.FAILED,
        processingLog: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
};

// Study Report Management
const createStudyReport = async (
  userId: string,
  payload: IStudyReportCreate
) => {
  const reportData = {
    ...payload,
    userId,
    sessionDate: new Date(payload.sessionDate),
  };

  const newReport = await prisma.studyReport.create({
    data: reportData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      studySession: true,
      focusSession: true,
      readingMaterial: {
        select: {
          id: true,
          title: true,
          topics: true,
        },
      },
    },
  });

  // Generate AI analysis for the report
  generateStudyReportAnalysis(newReport.id, userId);

  return newReport;
};

const generateStudyReportAnalysis = async (
  reportId: string,
  userId: string
) => {
  try {
    const report = await prisma.studyReport.findUnique({
      where: { id: reportId },
      include: {
        subject: true,
        readingMaterial: true,
        studySession: true,
        focusSession: true,
      },
    });

    if (!report) return;

    // Prepare session data for AI analysis
    const sessionData = {
      duration: report.sessionDuration,
      subjectName: report.subject?.name,
      materialsCovered: report.readingMaterial?.topics || [],
      notesContent: "", // Will be filled from uploaded notes
      focusInterruptions: report.focusSession?.distractions || 0,
    };

    const aiAnalysis = await learningAIService.analyzeStudySession(sessionData);

    // Update report with AI analysis
    await prisma.studyReport.update({
      where: { id: reportId },
      data: {
        topicsCovered: aiAnalysis.topicsCovered,
        keyConceptsLearned: aiAnalysis.keyConceptsLearned,
        comprehensionScore: aiAnalysis.comprehensionScore,
        focusScore: aiAnalysis.focusScore,
        productivityScore: aiAnalysis.productivityScore,
        recommendations: aiAnalysis.recommendations,
        nextSteps: aiAnalysis.nextSteps,
        weakAreas: aiAnalysis.weakAreas,
        questionsGenerated: aiAnalysis.questionsGenerated,
      },
    });

    // Update learning streaks
    await updateLearningStreaks(userId, {
      subjectId: report.subjectId || undefined,
      studyDuration: report.sessionDuration,
      sessionDate: report.sessionDate,
    });
  } catch (error) {
    console.error("Error generating study report analysis:", error);
  }
};

const getStudyReports = async (
  userId: string,
  filters: IStudyReportFilters,
  page = 1,
  limit = 10
) => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }

  if (filters.startDate || filters.endDate) {
    where.sessionDate = {};
    if (filters.startDate) {
      where.sessionDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.sessionDate.lte = new Date(filters.endDate);
    }
  }

  if (filters.minScore) {
    where.OR = [
      { comprehensionScore: { gte: filters.minScore } },
      { focusScore: { gte: filters.minScore } },
      { productivityScore: { gte: filters.minScore } },
    ];
  }

  const [reports, total] = await Promise.all([
    prisma.studyReport.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        readingMaterial: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { sessionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.studyReport.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getStudyReportById = async (userId: string, reportId: string) => {
  const report = await prisma.studyReport.findFirst({
    where: {
      id: reportId,
      userId,
    },
    include: {
      subject: true,
      studySession: true,
      focusSession: true,
      readingMaterial: true,
    },
  });

  if (!report) {
    throw new ApiError(404, "Study report not found");
  }

  return report;
};

// Notes Upload and Validation
const createUploadedNote = async (
  userId: string,
  payload: IUploadedNoteCreate
) => {
  const noteData = {
    ...payload,
    userId,
    validationStatus: ValidationStatus.PENDING,
  };

  const newNote = await prisma.uploadedNote.create({
    data: noteData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      readingMaterial: {
        select: {
          id: true,
          title: true,
          topics: true,
          extractedText: true,
        },
      },
    },
  });

  // Validate notes with AI
  validateNotesWithAI(newNote.id, userId);

  return newNote;
};

const validateNotesWithAI = async (noteId: string, userId: string) => {
  try {
    const note = await prisma.uploadedNote.findUnique({
      where: { id: noteId },
      include: {
        readingMaterial: true,
      },
    });

    if (!note) return;

    const aiValidation = await learningAIService.validateNotes(
      note.content,
      note.readingMaterial?.extractedText || undefined,
      note.readingMaterial?.topics || undefined
    );

    let validationStatus = ValidationStatus.VALIDATED;
    if (
      aiValidation.comprehensionScore < 60 ||
      aiValidation.completenessScore < 60
    ) {
      validationStatus = ValidationStatus.NEEDS_IMPROVEMENT;
    }
    if (aiValidation.accuracyScore < 40) {
      validationStatus = ValidationStatus.REJECTED;
    }

    await prisma.uploadedNote.update({
      where: { id: noteId },
      data: {
        validationStatus,
        comprehensionScore: aiValidation.comprehensionScore,
        completenessScore: aiValidation.completenessScore,
        accuracyScore: aiValidation.accuracyScore,
        aiMissing: aiValidation.missingTopics,
        aiSuggestions: aiValidation.suggestions,
        aiFeedback: aiValidation.feedback,
        coveragePercentage: aiValidation.coveragePercentage,
      },
    });

    // Update learning streaks for notes validation
    if (validationStatus === ValidationStatus.VALIDATED) {
      await updateNotesValidationStreak(userId, note.subjectId || undefined);
    }
  } catch (error) {
    console.error("Error validating notes with AI:", error);

    await prisma.uploadedNote.update({
      where: { id: noteId },
      data: {
        validationStatus: ValidationStatus.REJECTED,
        aiFeedback: "AI validation failed. Please review manually.",
      },
    });
  }
};

const getUploadedNotes = async (
  userId: string,
  filters: IUploadedNoteFilters,
  page = 1,
  limit = 10
) => {
  const where: any = { userId };

  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }

  if (filters.validationStatus) {
    where.validationStatus = filters.validationStatus;
  }

  if (filters.readingMaterialId) {
    where.readingMaterialId = filters.readingMaterialId;
  }

  if (filters.minScore) {
    where.OR = [
      { comprehensionScore: { gte: filters.minScore } },
      { completenessScore: { gte: filters.minScore } },
      { accuracyScore: { gte: filters.minScore } },
    ];
  }

  const [notes, total] = await Promise.all([
    prisma.uploadedNote.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        readingMaterial: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.uploadedNote.count({ where }),
  ]);

  return {
    notes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUploadedNoteById = async (userId: string, noteId: string) => {
  const note = await prisma.uploadedNote.findFirst({
    where: {
      id: noteId,
      userId,
    },
    include: {
      subject: true,
      readingMaterial: true,
      studySession: true,
    },
  });

  if (!note) {
    throw new ApiError(404, "Uploaded note not found");
  }

  return note;
};

// Learning Streak Management
const createLearningStreak = async (
  userId: string,
  payload: ILearningStreakCreate
) => {
  const streakData = {
    ...payload,
    userId,
    streakStartDate: new Date(),
  };

  const newStreak = await prisma.learningStreak.create({
    data: streakData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return newStreak;
};

const getLearningStreaks = async (
  userId: string,
  filters: ILearningStreakFilters,
  page = 1,
  limit = 10
) => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [streaks, total] = await Promise.all([
    prisma.learningStreak.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            streakEntries: true,
          },
        },
      },
      orderBy: { currentStreak: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.learningStreak.count({ where }),
  ]);

  return {
    streaks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const addStreakEntry = async (
  userId: string,
  streakId: string,
  payload: IStreakEntryCreate
) => {
  const streak = await prisma.learningStreak.findFirst({
    where: {
      id: streakId,
      userId,
    },
  });

  if (!streak) {
    throw new ApiError(404, "Learning streak not found");
  }

  const entryData = {
    ...payload,
    date: new Date(payload.date),
    streakId,
  };

  const newEntry = await prisma.streakEntry.create({
    data: entryData,
  });

  // Update streak statistics
  await updateStreakStatistics(streakId);

  return newEntry;
};

// Learning Analytics and Dashboard
const getLearningDashboard = async (
  userId: string,
  period = "week"
): Promise<ILearningDashboard> => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const [overallStats, currentStreaks, recentReports, weeklyData] =
    await Promise.all([
      getOverallStats(userId),
      getCurrentStreaks(userId),
      getRecentReports(userId, 5),
      getWeeklyProgress(userId, startDate, now),
    ]);

  const aiInsights = await generateAIInsights(userId, startDate, now);

  return {
    overallStats,
    currentStreaks: currentStreaks as any,
    recentReports: recentReports as any,
    weeklyProgress: weeklyData,
    aiInsights,
  };
};

// Helper functions for streak management
const updateLearningStreaks = async (
  userId: string,
  data: {
    subjectId?: string | undefined;
    studyDuration: number;
    sessionDate: Date;
  }
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update daily study streak
  await updateDailyStudyStreak(userId, data.studyDuration, today);

  // Update subject-specific streak if applicable
  if (data.subjectId) {
    await updateSubjectStreak(
      userId,
      data.subjectId,
      data.studyDuration,
      today
    );
  }
};

const updateNotesValidationStreak = async (
  userId: string,
  subjectId?: string
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find or create notes validation streak
  let streak = await prisma.learningStreak.findFirst({
    where: {
      userId,
      type: StreakType.NOTES_VALIDATION,
      isActive: true,
    },
  });

  if (!streak) {
    streak = await prisma.learningStreak.create({
      data: {
        userId,
        type: StreakType.NOTES_VALIDATION,
        title: "Notes Validation Streak",
        description: "Consecutive days of validated notes",
        targetValue: 1,
        targetUnit: "notes",
        streakStartDate: today,
        lastActiveDate: today,
      },
    });
  }

  // Add entry for today
  await prisma.streakEntry.upsert({
    where: {
      streakId_date: {
        streakId: streak.id,
        date: today,
      },
    },
    update: {
      value: { increment: 1 },
      goalMet: true,
    },
    create: {
      streakId: streak.id,
      date: today,
      value: 1,
      goalMet: true,
    },
  });

  await updateStreakStatistics(streak.id);
};

// More helper functions would be implemented here...
// (getOverallStats, getCurrentStreaks, getRecentReports, etc.)

// Helper function implementations
const getOverallStats = async (userId: string) => {
  const [materials, reports, notes] = await Promise.all([
    prisma.readingMaterial.count({ where: { userId } }),
    prisma.studyReport.count({ where: { userId } }),
    prisma.uploadedNote.count({ where: { userId } }),
  ]);

  const avgScores = await prisma.studyReport.aggregate({
    where: { userId },
    _avg: {
      comprehensionScore: true,
    },
  });

  const totalStudyTime = await prisma.studyReport.aggregate({
    where: { userId },
    _sum: {
      sessionDuration: true,
    },
  });

  return {
    totalReadingMaterials: materials,
    totalStudyReports: reports,
    totalNotesUploaded: notes,
    averageComprehensionScore: avgScores._avg.comprehensionScore || 0,
    totalStudyTime: (totalStudyTime._sum.sessionDuration || 0) / 60, // Convert to hours
  };
};

const getCurrentStreaks = async (userId: string) => {
  return await prisma.learningStreak.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { currentStreak: "desc" },
    take: 5,
  });
};

const getRecentReports = async (userId: string, limit: number) => {
  return await prisma.studyReport.findMany({
    where: { userId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: { sessionDate: "desc" },
    take: limit,
  });
};

const getWeeklyProgress = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const reports = await prisma.studyReport.findMany({
    where: {
      userId,
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const materials = await prisma.readingMaterial.count({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const validatedNotes = await prisma.uploadedNote.count({
    where: {
      userId,
      validationStatus: ValidationStatus.VALIDATED,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalHours =
    reports.reduce((sum, report) => sum + report.sessionDuration, 0) / 60;
  const avgComprehension =
    reports.length > 0
      ? reports.reduce(
          (sum, report) => sum + (report.comprehensionScore || 0),
          0
        ) / reports.length
      : 0;
  const avgFocus =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + (report.focusScore || 0), 0) /
        reports.length
      : 0;
  const avgProductivity =
    reports.length > 0
      ? reports.reduce(
          (sum, report) => sum + (report.productivityScore || 0),
          0
        ) / reports.length
      : 0;

  return {
    studyHours: totalHours,
    materialsRead: materials,
    notesValidated: validatedNotes,
    averageScores: {
      comprehension: avgComprehension,
      focus: avgFocus,
      productivity: avgProductivity,
    },
  };
};

const generateAIInsights = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const reports = await prisma.studyReport.findMany({
    where: {
      userId,
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      subject: true,
    },
  });

  const subjectPerformance: {
    [key: string]: { name: string; avgScore: number; sessions: number };
  } = {};

  reports.forEach((report) => {
    if (report.subject) {
      const subjectId = report.subject.id;
      if (!subjectPerformance[subjectId]) {
        subjectPerformance[subjectId] = {
          name: report.subject.name,
          avgScore: 0,
          sessions: 0,
        };
      }
      subjectPerformance[subjectId].avgScore += report.comprehensionScore || 0;
      subjectPerformance[subjectId].sessions += 1;
    }
  });

  Object.keys(subjectPerformance).forEach((subjectId) => {
    const perf = subjectPerformance[subjectId];
    perf.avgScore = perf.avgScore / perf.sessions;
  });

  const sortedSubjects = Object.values(subjectPerformance).sort(
    (a, b) => b.avgScore - a.avgScore
  );

  return {
    strongSubjects: sortedSubjects.slice(0, 3).map((s) => s.name),
    weakSubjects: sortedSubjects.slice(-3).map((s) => s.name),
    recommendedFocus: sortedSubjects.slice(-2).map((s) => s.name),
    learningTrends: ["Improving focus scores", "Consistent study patterns"],
  };
};

const updateDailyStudyStreak = async (
  userId: string,
  duration: number,
  date: Date
) => {
  let streak = await prisma.learningStreak.findFirst({
    where: {
      userId,
      type: StreakType.DAILY_STUDY,
      isActive: true,
    },
  });

  if (!streak) {
    streak = await prisma.learningStreak.create({
      data: {
        userId,
        type: StreakType.DAILY_STUDY,
        title: "Daily Study Streak",
        description: "Consecutive days of studying",
        targetValue: 1,
        targetUnit: "hours",
        streakStartDate: date,
        lastActiveDate: date,
      },
    });
  }

  await prisma.streakEntry.upsert({
    where: {
      streakId_date: {
        streakId: streak.id,
        date: date,
      },
    },
    update: {
      value: { increment: duration / 60 },
      goalMet: true,
    },
    create: {
      streakId: streak.id,
      date: date,
      value: duration / 60,
      goalMet: duration >= 60, // Goal is at least 1 hour
    },
  });

  await updateStreakStatistics(streak.id);
};

const updateSubjectStreak = async (
  userId: string,
  subjectId: string,
  duration: number,
  date: Date
) => {
  let streak = await prisma.learningStreak.findFirst({
    where: {
      userId,
      subjectId,
      type: StreakType.SUBJECT_FOCUS,
      isActive: true,
    },
  });

  if (!streak) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    streak = await prisma.learningStreak.create({
      data: {
        userId,
        subjectId,
        type: StreakType.SUBJECT_FOCUS,
        title: `${subject?.name} Focus Streak`,
        description: `Consecutive days studying ${subject?.name}`,
        targetValue: 0.5,
        targetUnit: "hours",
        streakStartDate: date,
        lastActiveDate: date,
      },
    });
  }

  await prisma.streakEntry.upsert({
    where: {
      streakId_date: {
        streakId: streak.id,
        date: date,
      },
    },
    update: {
      value: { increment: duration / 60 },
      goalMet: true,
    },
    create: {
      streakId: streak.id,
      date: date,
      value: duration / 60,
      goalMet: duration >= 30, // Goal is at least 30 minutes
    },
  });

  await updateStreakStatistics(streak.id);
};

const updateStreakStatistics = async (streakId: string) => {
  const entries = await prisma.streakEntry.findMany({
    where: { streakId },
    orderBy: { date: "desc" },
  });

  if (entries.length === 0) return;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  // Calculate current streak (from most recent date)
  for (const entry of entries) {
    if (!lastDate) {
      lastDate = entry.date;
      if (entry.goalMet) {
        currentStreak = 1;
        tempStreak = 1;
      }
      continue;
    }

    const daysDiff = Math.floor(
      (lastDate.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1 && entry.goalMet) {
      currentStreak++;
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = entry.goalMet ? 1 : 0;
    }

    lastDate = entry.date;
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  await prisma.learningStreak.update({
    where: { id: streakId },
    data: {
      currentStreak,
      longestStreak,
      totalDays: entries.length,
      lastActiveDate: entries[0].date,
    },
  });
};

export {
  addStreakEntry,
  createLearningStreak,
  createReadingMaterial,
  createStudyReport,
  createUploadedNote,
  deleteReadingMaterial,
  getLearningDashboard,
  getLearningStreaks,
  getReadingMaterialById,
  getReadingMaterials,
  getStudyReportById,
  getStudyReports,
  getUploadedNoteById,
  getUploadedNotes,
  processReadingMaterialWithAI,
  updateReadingMaterial,
  validateNotesWithAI,
};
