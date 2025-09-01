export interface IAnalyticsRequest {
  userId: string;
  subjectId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  period: AnalyticsPeriod;
}

export interface ILearningCurveData {
  subject: string;
  subjectId: string;
  dataPoints: IPerformancePoint[];
  trendAnalysis: {
    trend: "improving" | "stable" | "declining";
    improvementRate: number; // percentage per week
    confidence: number; // 0-100%
  };
  projectedPerformance: number; // projected score for next period
}

export interface IPerformancePoint {
  date: Date;
  score: number; // 0-100
  type: "quiz" | "study_session" | "focus_session" | "exam";
  duration?: number; // in minutes
  difficulty?: string;
  topic?: string;
}

export interface IWeaknessAnalysis {
  subject: string;
  subjectId: string;
  weakTopics: IWeakTopic[];
  aiInsights: {
    primaryWeakness: string;
    recommendedActions: string[];
    studyTimeAllocation: IStudyTimeRecommendation[];
    difficultyProgression: string;
  };
  confidenceLevel: number; // 0-100%
}

export interface IWeakTopic {
  topic: string;
  weaknessLevel: "mild" | "moderate" | "severe";
  averageScore: number;
  questionsAttempted: number;
  lastStudied?: Date;
  recommendedStudyTime: number; // hours
}

export interface IStudyTimeRecommendation {
  topic: string;
  recommendedHours: number;
  priority: "high" | "medium" | "low";
  reasoning: string;
}

export interface IStudyPatternAnalysis {
  userId: string;
  optimalStudyTimes: IOptimalTime[];
  studyEfficiencyBySubject: ISubjectEfficiency[];
  sessionDurationOptimization: {
    recommendedDuration: number; // minutes
    breakFrequency: number; // minutes between breaks
    focusModePreference: "POMODORO" | "DEEP_WORK" | "CUSTOM";
  };
  aiRecommendations: string[];
}

export interface IOptimalTime {
  hour: number; // 0-23
  dayOfWeek: string;
  efficiency: number; // 0-100%
  subject?: string;
  reasoning: string;
}

export interface ISubjectEfficiency {
  subject: string;
  subjectId: string;
  averageEfficiency: number;
  bestStudyMethod: "reading" | "practice" | "video" | "discussion";
  optimalSessionLength: number; // minutes
  retentionRate: number; // percentage
}

export interface IPredictiveModel {
  examId?: string;
  subject: string;
  predictedScore: number; // 0-100
  confidence: number; // 0-100%
  factors: IPredictionFactor[];
  recommendations: IExamPreparationPlan;
  riskAssessment: {
    riskLevel: "low" | "medium" | "high";
    keyRisks: string[];
    mitigationStrategies: string[];
  };
}

export interface IPredictionFactor {
  factor: string;
  impact: number; // -100 to +100
  description: string;
  improvable: boolean;
}

export interface IExamPreparationPlan {
  totalStudyHoursNeeded: number;
  weeklySchedule: IWeeklyStudyPlan[];
  priorityTopics: string[];
  practiceQuestionsNeeded: number;
  reviewSessions: number;
}

export interface IWeeklyStudyPlan {
  week: number;
  topics: string[];
  studyHours: number;
  practiceQuestions: number;
  focusAreas: string[];
}

export interface IAnalyticsDashboard {
  overview: {
    totalStudyTime: number; // hours this period
    averagePerformance: number; // 0-100
    improvementRate: number; // percentage change
    streakDays: number;
  };
  subjectBreakdown: ISubjectAnalytics[];
  learningCurves: ILearningCurveData[];
  weaknessReport: IWeaknessAnalysis[];
  studyPatterns: IStudyPatternAnalysis;
  predictions: IPredictiveModel[];
  aiInsights: {
    keyInsights: string[];
    recommendations: string[];
    nextSteps: string[];
    celebratedAchievements: string[];
  };
}

export interface ISubjectAnalytics {
  subjectId: string;
  subjectName: string;
  totalStudyTime: number;
  averageScore: number;
  questionsAttempted: number;
  questionsCorrect: number;
  lastStudied: Date;
  trend: "improving" | "stable" | "declining";
  strongTopics: string[];
  weakTopics: string[];
}

export interface ILearningEfficiency {
  timeToMastery: number; // days
  retentionRate: number; // percentage
  transferLearning: number; // how well knowledge applies to related topics
  metacognition: number; // awareness of own learning process
}

// Specialized types for subject-specific analytics
export interface IPhysicsAnalytics extends ISubjectAnalytics {
  conceptualUnderstanding: number; // 0-100
  mathematicalApplication: number; // 0-100
  problemSolvingStrategy: number; // 0-100
  experimentalDesign?: number; // 0-100
  favouriteTopics: PhysicsTopics[];
}

export interface IMathematicsAnalytics extends ISubjectAnalytics {
  abstractReasoning: number; // 0-100
  computationalSkills: number; // 0-100
  proofTechniques: number; // 0-100
  visualSpatialSkills: number; // 0-100
  favouriteAreas: MathematicsAreas[];
}

export interface IComputerScienceAnalytics extends ISubjectAnalytics {
  algorithmicThinking: number; // 0-100
  codeQuality: number; // 0-100
  systemDesign: number; // 0-100
  debugging: number; // 0-100
  programmingLanguages: string[];
}

export interface IChessAnalytics extends ISubjectAnalytics {
  tacticalSkill: number; // 0-100
  positionalUnderstanding: number; // 0-100
  openingKnowledge: number; // 0-100
  endgameSkill: number; // 0-100
  timeManagement: number; // 0-100
  favoriteOpenings: string[];
}

// Enums and constants
export enum AnalyticsPeriod {
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  SEMESTER = "semester",
  YEAR = "year",
}

export enum PhysicsTopics {
  MECHANICS = "mechanics",
  THERMODYNAMICS = "thermodynamics",
  ELECTROMAGNETISM = "electromagnetism",
  QUANTUM_MECHANICS = "quantum_mechanics",
  RELATIVITY = "relativity",
  OPTICS = "optics",
  NUCLEAR_PHYSICS = "nuclear_physics",
}

export enum MathematicsAreas {
  ALGEBRA = "algebra",
  CALCULUS = "calculus",
  LINEAR_ALGEBRA = "linear_algebra",
  STATISTICS = "statistics",
  DISCRETE_MATH = "discrete_math",
  DIFFERENTIAL_EQUATIONS = "differential_equations",
  NUMBER_THEORY = "number_theory",
}

export type AnalyticsSubjectType =
  | "physics"
  | "mathematics"
  | "computer_science"
  | "chess"
  | "general";
