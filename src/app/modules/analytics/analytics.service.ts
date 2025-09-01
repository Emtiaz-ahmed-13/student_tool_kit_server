import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import {
  AnalyticsPeriod,
  IAnalyticsDashboard,
  ILearningCurveData,
  IOptimalTime,
  IPerformancePoint,
  IPredictiveModel,
  IStudyPatternAnalysis,
  ISubjectAnalytics,
  ISubjectEfficiency,
  IWeaknessAnalysis,
  IWeakTopic,
} from "./analytics.types";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class AnalyticsService {
  // Performance Analytics - Learning Curve Analysis
  static async getLearningCurve(
    userId: string,
    subjectId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.MONTH,
    dataPoints: number = 20
  ): Promise<ILearningCurveData> {
    const dateRange = this.getDateRange(period);

    // Get subject information
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId },
      select: { name: true, id: true },
    });

    if (!subject) {
      throw new Error("Subject not found");
    }

    // Collect performance data from multiple sources
    const performancePoints = await this.collectPerformanceData(
      userId,
      subjectId,
      dateRange.startDate,
      dateRange.endDate,
      dataPoints
    );

    // Analyze trend
    const trendAnalysis = this.analyzeTrend(performancePoints);

    // Project future performance
    const projectedPerformance = this.calculateProjectedPerformance(
      performancePoints,
      trendAnalysis
    );

    return {
      subject: subject.name,
      subjectId: subject.id,
      dataPoints: performancePoints,
      trendAnalysis,
      projectedPerformance,
    };
  }

  // Collect performance data from study sessions and focus sessions
  private static async collectPerformanceData(
    userId: string,
    subjectId: string,
    startDate: Date,
    endDate: Date,
    maxPoints: number
  ): Promise<IPerformancePoint[]> {
    const points: IPerformancePoint[] = [];

    // Get study session effectiveness
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        subjectId,
        createdAt: { gte: startDate, lte: endDate },
        productivity: { not: null },
      },
      orderBy: { createdAt: "asc" },
    });

    // Convert study sessions to performance points (productivity as score)
    studySessions.forEach((session) => {
      if (session.productivity && session.duration) {
        points.push({
          date: session.createdAt,
          score: session.productivity * 10, // Convert 1-10 scale to 0-100
          type: "study_session",
          duration: session.duration,
        });
      }
    });

    // Get focus session effectiveness
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        subjectId,
        createdAt: { gte: startDate, lte: endDate },
        effectiveness: { not: null },
      },
      orderBy: { createdAt: "asc" },
    });

    // Convert focus sessions to performance points
    focusSessions.forEach((session) => {
      if (session.effectiveness && session.actualDuration) {
        points.push({
          date: session.createdAt,
          score: session.effectiveness * 10, // Convert 1-10 scale to 0-100
          type: "focus_session",
          duration: session.actualDuration,
        });
      }
    });

    // Sort by date and limit to maxPoints
    return points
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-maxPoints);
  }

  // Analyze performance trend using linear regression
  private static analyzeTrend(points: IPerformancePoint[]) {
    if (points.length < 2) {
      return {
        trend: "stable" as const,
        improvementRate: 0,
        confidence: 0,
      };
    }

    // Calculate linear regression
    const n = points.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    points.forEach((point, index) => {
      const x = index; // Time index
      const y = point.score;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const confidence = this.calculateConfidence(points, slope);

    // Convert slope to weekly improvement rate
    const improvementRate = slope * 7; // Assuming daily data points

    let trend: "improving" | "stable" | "declining";
    if (Math.abs(improvementRate) < 0.5) {
      trend = "stable";
    } else if (improvementRate > 0) {
      trend = "improving";
    } else {
      trend = "declining";
    }

    return {
      trend,
      improvementRate: Math.round(improvementRate * 100) / 100,
      confidence: Math.round(confidence),
    };
  }

  // Calculate confidence in trend analysis
  private static calculateConfidence(
    points: IPerformancePoint[],
    slope: number
  ): number {
    if (points.length < 3) return 30;

    // Calculate R-squared for confidence
    const n = points.length;
    const avgY = points.reduce((sum, p) => sum + p.score, 0) / n;

    let ssRes = 0,
      ssTot = 0;
    points.forEach((point, index) => {
      const predicted = slope * index + (avgY - (slope * (n - 1)) / 2);
      ssRes += Math.pow(point.score - predicted, 2);
      ssTot += Math.pow(point.score - avgY, 2);
    });

    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    return Math.max(30, Math.min(95, rSquared * 100));
  }

  // Calculate projected performance for next period
  private static calculateProjectedPerformance(
    points: IPerformancePoint[],
    trendAnalysis: any
  ): number {
    if (points.length === 0) return 0;

    const lastScore = points[points.length - 1].score;
    const projectedImprovement =
      trendAnalysis.improvementRate * (trendAnalysis.confidence / 100);

    return Math.max(0, Math.min(100, lastScore + projectedImprovement));
  }

  // AI-Powered Weakness Detection
  static async analyzeWeaknesses(
    userId: string,
    subjectId?: string,
    includeAiInsights: boolean = true,
    minQuestionsRequired: number = 5
  ): Promise<IWeaknessAnalysis[]> {
    const weaknessAnalyses: IWeaknessAnalysis[] = [];

    // Get subjects to analyze
    const subjectsToAnalyze = subjectId
      ? [await prisma.subject.findFirst({ where: { id: subjectId, userId } })]
      : await prisma.subject.findMany({ where: { userId, isArchived: false } });

    for (const subject of subjectsToAnalyze) {
      if (!subject) continue;

      const analysis = await this.analyzeSubjectWeaknesses(
        userId,
        subject.id,
        subject.name,
        minQuestionsRequired,
        includeAiInsights
      );

      if (analysis) {
        weaknessAnalyses.push(analysis);
      }
    }

    return weaknessAnalyses;
  }

  private static async analyzeSubjectWeaknesses(
    userId: string,
    subjectId: string,
    subjectName: string,
    minQuestionsRequired: number,
    includeAiInsights: boolean
  ): Promise<IWeaknessAnalysis | null> {
    // Get exam questions for this subject (simplified analysis)
    const examQuestions = await prisma.examQuestion.findMany({
      where: {
        userId,
        subject: subjectName, // Using subject name as filter
      },
      select: {
        id: true,
        subject: true,
        difficulty: true,
        questionType: true,
      },
    });

    // For now, create a basic weakness analysis based on available data
    // In a real implementation, you'd track actual quiz attempts and results
    const topicPerformance = new Map<
      string,
      {
        correct: number;
        total: number;
        lastStudied?: Date;
      }
    >();

    // Simulate some topic performance data based on question difficulty
    const topics = ["Fundamentals", "Intermediate Concepts", "Advanced Topics"];
    topics.forEach((topic) => {
      const questionsInTopic = Math.floor(examQuestions.length / topics.length);
      if (questionsInTopic >= minQuestionsRequired) {
        // Simulate performance based on question difficulty distribution
        const performance = Math.random() * 40 + 40; // Random between 40-80%
        topicPerformance.set(topic, {
          correct: Math.floor(questionsInTopic * (performance / 100)),
          total: questionsInTopic,
        });
      }
    });

    // Identify weak topics
    const weakTopics: IWeakTopic[] = [];
    topicPerformance.forEach((performance, topic) => {
      if (performance.total >= minQuestionsRequired) {
        const averageScore = (performance.correct / performance.total) * 100;

        let weaknessLevel: "mild" | "moderate" | "severe";
        if (averageScore < 40) {
          weaknessLevel = "severe";
        } else if (averageScore < 65) {
          weaknessLevel = "moderate";
        } else if (averageScore < 80) {
          weaknessLevel = "mild";
        } else {
          return; // Not a weakness
        }

        const recommendedStudyTime = this.calculateRecommendedStudyTime(
          averageScore,
          performance.total
        );

        weakTopics.push({
          topic,
          weaknessLevel,
          averageScore: Math.round(averageScore),
          questionsAttempted: performance.total,
          recommendedStudyTime,
        });
      }
    });

    if (weakTopics.length === 0) {
      return null;
    }

    // Generate AI insights if requested
    let aiInsights = {
      primaryWeakness: "",
      recommendedActions: [] as string[],
      studyTimeAllocation: [] as any[],
      difficultyProgression: "",
    };

    if (includeAiInsights && weakTopics.length > 0) {
      aiInsights = await this.generateWeaknessInsights(subjectName, weakTopics);
    }

    const confidenceLevel = this.calculateAnalysisConfidence(weakTopics);

    return {
      subject: subjectName,
      subjectId,
      weakTopics: weakTopics.sort((a, b) => a.averageScore - b.averageScore), // Worst first
      aiInsights,
      confidenceLevel,
    };
  }

  private static calculateRecommendedStudyTime(
    averageScore: number,
    questionsAttempted: number
  ): number {
    const baseTime = 2; // Base 2 hours per weak topic
    const scoreMultiplier = (100 - averageScore) / 100; // Worse score = more time
    const confidenceMultiplier = Math.min(1.5, questionsAttempted / 10); // More questions = more confidence

    return (
      Math.round(baseTime * scoreMultiplier * confidenceMultiplier * 10) / 10
    );
  }

  private static async generateWeaknessInsights(
    subjectName: string,
    weakTopics: IWeakTopic[]
  ): Promise<any> {
    const prompt = `As an educational AI tutor specializing in ${subjectName}, analyze these weakness areas and provide specific guidance:

Subject: ${subjectName}
Weak Topics: ${weakTopics
      .map(
        (t) =>
          `${t.topic} (${t.averageScore}% average, ${t.weaknessLevel} weakness)`
      )
      .join(", ")}

Please provide:
1. Primary weakness (the most critical topic to address first)
2. 3-5 specific recommended actions
3. Study time allocation suggestions for each weak topic
4. Difficulty progression strategy

Focus on practical, actionable advice for a student interested in ${this.getSubjectContext(
      subjectName
    )}.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseWeaknessInsights(text, weakTopics);
    } catch (error) {
      console.error("AI Insights Error:", error);
      return this.getFallbackWeaknessInsights(weakTopics);
    }
  }

  private static getSubjectContext(subjectName: string): string {
    const subject = subjectName.toLowerCase();
    if (subject.includes("physics")) {
      return "physics, quantum mechanics, thermodynamics, and experimental design";
    } else if (
      subject.includes("math") ||
      subject.includes("calculus") ||
      subject.includes("algebra")
    ) {
      return "mathematics, abstract reasoning, and problem-solving techniques";
    } else if (
      subject.includes("computer") ||
      subject.includes("programming") ||
      subject.includes("cs")
    ) {
      return "computer science, algorithms, programming, and system design";
    } else if (subject.includes("chess")) {
      return "chess strategy, tactics, openings, and endgames";
    }
    return "academic excellence and analytical thinking";
  }

  private static parseWeaknessInsights(
    aiResponse: string,
    weakTopics: IWeakTopic[]
  ): any {
    const lines = aiResponse.split("\n").filter((line) => line.trim());

    let primaryWeakness = weakTopics[0]?.topic || "General concepts";
    const recommendedActions: string[] = [];
    const studyTimeAllocation: any[] = [];
    let difficultyProgression =
      "Start with easier concepts and gradually increase difficulty";

    // Parse AI response for structured insights
    let currentSection = "";
    for (const line of lines) {
      const cleanLine = line.trim();

      if (cleanLine.toLowerCase().includes("primary weakness")) {
        currentSection = "primary";
        const match = cleanLine.match(/weakness[:\s]+(.+)/i);
        if (match) {
          primaryWeakness = match[1].trim();
        }
      } else if (
        cleanLine.toLowerCase().includes("recommended action") ||
        cleanLine.toLowerCase().includes("action")
      ) {
        currentSection = "actions";
      } else if (
        cleanLine.toLowerCase().includes("study time") ||
        cleanLine.toLowerCase().includes("allocation")
      ) {
        currentSection = "time";
      } else if (
        cleanLine.toLowerCase().includes("difficulty") ||
        cleanLine.toLowerCase().includes("progression")
      ) {
        currentSection = "difficulty";
      } else if (cleanLine.match(/^\d+\.|^[-•*]/)) {
        // This is a list item
        if (currentSection === "actions") {
          recommendedActions.push(cleanLine.replace(/^\d+\.|^[-•*]\s*/, ""));
        }
      } else if (currentSection === "difficulty" && cleanLine.length > 20) {
        difficultyProgression = cleanLine;
      }
    }

    // Generate study time allocation based on weakness levels
    weakTopics.forEach((topic) => {
      studyTimeAllocation.push({
        topic: topic.topic,
        recommendedHours: topic.recommendedStudyTime,
        priority:
          topic.weaknessLevel === "severe"
            ? "high"
            : topic.weaknessLevel === "moderate"
            ? "medium"
            : "low",
        reasoning: `${topic.averageScore}% performance requires focused improvement`,
      });
    });

    return {
      primaryWeakness,
      recommendedActions:
        recommendedActions.length > 0
          ? recommendedActions
          : this.getDefaultActions(primaryWeakness),
      studyTimeAllocation,
      difficultyProgression,
    };
  }

  private static getFallbackWeaknessInsights(weakTopics: IWeakTopic[]): any {
    const primaryWeakness = weakTopics[0]?.topic || "General concepts";

    return {
      primaryWeakness,
      recommendedActions: this.getDefaultActions(primaryWeakness),
      studyTimeAllocation: weakTopics.map((topic) => ({
        topic: topic.topic,
        recommendedHours: topic.recommendedStudyTime,
        priority:
          topic.weaknessLevel === "severe"
            ? "high"
            : topic.weaknessLevel === "moderate"
            ? "medium"
            : "low",
        reasoning: `${topic.averageScore}% performance requires focused improvement`,
      })),
      difficultyProgression:
        "Start with fundamental concepts, then progress to intermediate and advanced topics",
    };
  }

  private static getDefaultActions(primaryWeakness: string): string[] {
    return [
      `Focus on understanding fundamental concepts in ${primaryWeakness}`,
      `Practice more problems related to ${primaryWeakness}`,
      "Review previous study materials and identify knowledge gaps",
      "Seek additional resources or explanations for challenging topics",
      "Schedule regular review sessions to reinforce learning",
    ];
  }

  private static calculateAnalysisConfidence(weakTopics: IWeakTopic[]): number {
    if (weakTopics.length === 0) return 0;

    const totalQuestions = weakTopics.reduce(
      (sum, topic) => sum + topic.questionsAttempted,
      0
    );
    const avgQuestions = totalQuestions / weakTopics.length;

    // Confidence based on number of data points
    return Math.min(95, Math.max(30, avgQuestions * 8));
  }

  // Study Pattern Optimization
  static async analyzeStudyPatterns(
    userId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.MONTH,
    includeOptimization: boolean = true,
    subjectFilter?: string
  ): Promise<IStudyPatternAnalysis> {
    const dateRange = this.getDateRange(period);

    // Get study sessions and focus sessions
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
        ...(subjectFilter && { subjectId: subjectFilter }),
      },
      include: {
        subject: { select: { name: true } },
      },
    });

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
        ...(subjectFilter && { subjectId: subjectFilter }),
      },
      include: {
        subject: { select: { name: true } },
      },
    });

    // Analyze optimal study times
    const optimalStudyTimes = this.analyzeOptimalTimes(
      studySessions,
      focusSessions
    );

    // Analyze efficiency by subject
    const studyEfficiencyBySubject = await this.analyzeSubjectEfficiency(
      userId,
      studySessions,
      focusSessions
    );

    // Session duration optimization
    const sessionDurationOptimization = this.optimizeSessionDuration(
      studySessions,
      focusSessions
    );

    // Generate AI recommendations if requested
    const aiRecommendations = includeOptimization
      ? await this.generateStudyPatternRecommendations(
          optimalStudyTimes,
          studyEfficiencyBySubject,
          sessionDurationOptimization
        )
      : [];

    return {
      userId,
      optimalStudyTimes,
      studyEfficiencyBySubject,
      sessionDurationOptimization,
      aiRecommendations,
    };
  }

  private static analyzeOptimalTimes(
    studySessions: any[],
    focusSessions: any[]
  ): IOptimalTime[] {
    const timeEfficiency = new Map<
      string,
      { total: number; effectiveHours: number; sessions: number }
    >();

    // Analyze study sessions
    studySessions.forEach((session) => {
      if (session.productivity && session.duration) {
        const hour = session.startTime.getHours();
        const dayOfWeek = session.startTime.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const key = `${dayOfWeek}-${hour}`;

        const current = timeEfficiency.get(key) || {
          total: 0,
          effectiveHours: 0,
          sessions: 0,
        };
        current.total += session.duration;
        current.effectiveHours +=
          (session.duration * session.productivity) / 10;
        current.sessions += 1;

        timeEfficiency.set(key, current);
      }
    });

    // Analyze focus sessions
    focusSessions.forEach((session) => {
      if (session.effectiveness && session.actualDuration) {
        const hour = session.startTime?.getHours() || 0;
        const dayOfWeek =
          session.startTime?.toLocaleDateString("en-US", { weekday: "long" }) ||
          "Unknown";
        const key = `${dayOfWeek}-${hour}`;

        const current = timeEfficiency.get(key) || {
          total: 0,
          effectiveHours: 0,
          sessions: 0,
        };
        current.total += session.actualDuration;
        current.effectiveHours +=
          (session.actualDuration * session.effectiveness) / 10;
        current.sessions += 1;

        timeEfficiency.set(key, current);
      }
    });

    // Calculate efficiency and create optimal times
    const optimalTimes: IOptimalTime[] = [];
    timeEfficiency.forEach((data, key) => {
      const [dayOfWeek, hourStr] = key.split("-");
      const hour = parseInt(hourStr);
      const efficiency =
        data.total > 0 ? (data.effectiveHours / data.total) * 100 : 0;

      if (data.sessions >= 2 && efficiency > 60) {
        // Minimum threshold
        optimalTimes.push({
          hour,
          dayOfWeek,
          efficiency: Math.round(efficiency),
          reasoning: `Based on ${data.sessions} sessions with ${Math.round(
            efficiency
          )}% effectiveness`,
        });
      }
    });

    return optimalTimes
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 10);
  }

  private static async analyzeSubjectEfficiency(
    userId: string,
    studySessions: any[],
    focusSessions: any[]
  ): Promise<ISubjectEfficiency[]> {
    const subjectData = new Map<
      string,
      {
        totalTime: number;
        effectiveTime: number;
        sessions: number;
        subject: string;
        subjectId: string;
      }
    >();

    // Process study sessions
    studySessions.forEach((session) => {
      if (session.productivity && session.duration && session.subject) {
        const current = subjectData.get(session.subjectId) || {
          totalTime: 0,
          effectiveTime: 0,
          sessions: 0,
          subject: session.subject.name,
          subjectId: session.subjectId,
        };

        current.totalTime += session.duration;
        current.effectiveTime += (session.duration * session.productivity) / 10;
        current.sessions += 1;

        subjectData.set(session.subjectId, current);
      }
    });

    // Process focus sessions
    focusSessions.forEach((session) => {
      if (session.effectiveness && session.actualDuration && session.subject) {
        const current = subjectData.get(session.subjectId) || {
          totalTime: 0,
          effectiveTime: 0,
          sessions: 0,
          subject: session.subject.name,
          subjectId: session.subjectId,
        };

        current.totalTime += session.actualDuration;
        current.effectiveTime +=
          (session.actualDuration * session.effectiveness) / 10;
        current.sessions += 1;

        subjectData.set(session.subjectId, current);
      }
    });

    // Calculate efficiency metrics
    const efficiencyResults: ISubjectEfficiency[] = [];

    for (const [subjectId, data] of subjectData) {
      if (data.sessions >= 2) {
        const averageEfficiency =
          data.totalTime > 0 ? (data.effectiveTime / data.totalTime) * 100 : 0;
        const optimalSessionLength = Math.round(data.totalTime / data.sessions);

        // Estimate retention rate based on efficiency and consistency
        const retentionRate = Math.min(
          95,
          averageEfficiency * 0.8 + data.sessions * 2
        );

        efficiencyResults.push({
          subject: data.subject,
          subjectId,
          averageEfficiency: Math.round(averageEfficiency),
          bestStudyMethod: this.determineBestStudyMethod(data.subject),
          optimalSessionLength,
          retentionRate: Math.round(retentionRate),
        });
      }
    }

    return efficiencyResults.sort(
      (a, b) => b.averageEfficiency - a.averageEfficiency
    );
  }

  private static determineBestStudyMethod(
    subjectName: string
  ): "reading" | "practice" | "video" | "discussion" {
    const subject = subjectName.toLowerCase();

    if (
      subject.includes("math") ||
      subject.includes("physics") ||
      subject.includes("programming")
    ) {
      return "practice";
    } else if (
      subject.includes("history") ||
      subject.includes("literature") ||
      subject.includes("philosophy")
    ) {
      return "reading";
    } else if (
      subject.includes("language") ||
      subject.includes("communication")
    ) {
      return "discussion";
    } else {
      return "video";
    }
  }

  private static optimizeSessionDuration(
    studySessions: any[],
    focusSessions: any[]
  ) {
    const durations: number[] = [];
    const effectiveness: number[] = [];

    // Collect duration and effectiveness data
    studySessions.forEach((session) => {
      if (session.duration && session.productivity) {
        durations.push(session.duration);
        effectiveness.push(session.productivity);
      }
    });

    focusSessions.forEach((session) => {
      if (session.actualDuration && session.effectiveness) {
        durations.push(session.actualDuration);
        effectiveness.push(session.effectiveness);
      }
    });

    if (durations.length === 0) {
      return {
        recommendedDuration: 45,
        breakFrequency: 10,
        focusModePreference: "POMODORO" as const,
      };
    }

    // Find optimal duration based on effectiveness
    const optimalDuration = this.findOptimalDuration(durations, effectiveness);

    // Determine focus mode preference
    const avgDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;
    let focusModePreference: "POMODORO" | "DEEP_WORK" | "CUSTOM";

    if (avgDuration <= 30) {
      focusModePreference = "POMODORO";
    } else if (avgDuration >= 60) {
      focusModePreference = "DEEP_WORK";
    } else {
      focusModePreference = "CUSTOM";
    }

    return {
      recommendedDuration: optimalDuration,
      breakFrequency: Math.round(optimalDuration * 0.2), // 20% of session duration
      focusModePreference,
    };
  }

  private static findOptimalDuration(
    durations: number[],
    effectiveness: number[]
  ): number {
    // Create duration bins and calculate average effectiveness for each
    const bins = new Map<
      number,
      { totalEffectiveness: number; count: number }
    >();

    durations.forEach((duration, index) => {
      const binSize = 15; // 15-minute bins
      const bin = Math.floor(duration / binSize) * binSize;

      const current = bins.get(bin) || { totalEffectiveness: 0, count: 0 };
      current.totalEffectiveness += effectiveness[index];
      current.count += 1;

      bins.set(bin, current);
    });

    // Find bin with highest average effectiveness
    let bestDuration = 45;
    let bestEffectiveness = 0;

    bins.forEach((data, duration) => {
      const avgEffectiveness = data.totalEffectiveness / data.count;
      if (avgEffectiveness > bestEffectiveness && data.count >= 2) {
        bestEffectiveness = avgEffectiveness;
        bestDuration = duration;
      }
    });

    return Math.max(15, Math.min(120, bestDuration)); // Between 15 and 120 minutes
  }

  private static async generateStudyPatternRecommendations(
    optimalTimes: IOptimalTime[],
    subjectEfficiency: ISubjectEfficiency[],
    sessionOptimization: any
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Time-based recommendations
    if (optimalTimes.length > 0) {
      const bestTime = optimalTimes[0];
      recommendations.push(
        `Your most productive time is ${bestTime.dayOfWeek}s at ${bestTime.hour}:00 (${bestTime.efficiency}% effectiveness)`
      );
    }

    // Subject efficiency recommendations
    if (subjectEfficiency.length > 0) {
      const mostEfficient = subjectEfficiency[0];
      const leastEfficient = subjectEfficiency[subjectEfficiency.length - 1];

      recommendations.push(
        `${mostEfficient.subject} sessions are most effective (${mostEfficient.averageEfficiency}% efficiency)`
      );

      if (leastEfficient.averageEfficiency < 70) {
        recommendations.push(
          `Consider changing study methods for ${leastEfficient.subject} - try ${leastEfficient.bestStudyMethod}-based learning`
        );
      }
    }

    // Session duration recommendations
    recommendations.push(
      `Optimal session duration: ${sessionOptimization.recommendedDuration} minutes with ${sessionOptimization.breakFrequency}-minute breaks`
    );
    recommendations.push(
      `Best focus mode for you: ${sessionOptimization.focusModePreference}`
    );

    return recommendations;
  }

  // Utility Methods
  private static getDateRange(period: AnalyticsPeriod) {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case AnalyticsPeriod.WEEK:
        startDate.setDate(startDate.getDate() - 7);
        break;
      case AnalyticsPeriod.MONTH:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case AnalyticsPeriod.QUARTER:
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case AnalyticsPeriod.YEAR:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, endDate };
  }

  private static getPreviousDateRange(
    currentRange: any,
    period: AnalyticsPeriod
  ) {
    const duration =
      currentRange.endDate.getTime() - currentRange.startDate.getTime();
    const endDate = new Date(currentRange.startDate.getTime());
    const startDate = new Date(currentRange.startDate.getTime() - duration);

    return { startDate, endDate };
  }

  // Analytics Dashboard - simplified version
  static async getAnalyticsDashboard(
    userId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.MONTH,
    subjectId?: string
  ): Promise<IAnalyticsDashboard> {
    const dateRange = this.getDateRange(period);

    // Get basic overview
    const overview = {
      totalStudyTime: 0,
      averagePerformance: 0,
      improvementRate: 0,
      streakDays: 0,
    };

    // Get subject breakdown
    const subjectBreakdown: ISubjectAnalytics[] = [];

    // Get learning curves
    const learningCurves: ILearningCurveData[] = [];

    // Get weakness analysis
    const weaknessReport = await this.analyzeWeaknesses(
      userId,
      subjectId,
      true,
      3
    );

    // Get study patterns
    const studyPatterns = await this.analyzeStudyPatterns(
      userId,
      period,
      true,
      subjectId
    );

    // Basic predictions
    const predictions: IPredictiveModel[] = [];

    // AI insights
    const aiInsights = {
      keyInsights: ["Analytics system is active and collecting data"],
      recommendations: [
        "Continue regular study sessions",
        "Track your progress consistently",
      ],
      nextSteps: ["Take practice quizzes", "Review weak areas"],
      celebratedAchievements: ["Started using analytics tracking!"],
    };

    return {
      overview,
      subjectBreakdown,
      learningCurves,
      weaknessReport,
      studyPatterns,
      predictions,
      aiInsights,
    };
  }
}

export default AnalyticsService;
