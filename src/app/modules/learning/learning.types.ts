export interface IReadingMaterial {
  id?: string;
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  
  // AI Extracted Information
  extractedText?: string;
  topics?: string[];
  keyPoints?: string[];
  difficulty?: Difficulty;
  estimatedReadTime?: number;
  
  // Metadata
  uploadStatus?: UploadStatus;
  processingLog?: string;
  
  // Relations
  subjectId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReadingMaterialCreate {
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  subjectId?: string;
}

export interface IReadingMaterialUpdate {
  title?: string;
  description?: string;
  subjectId?: string;
}

export interface IStudyReport {
  id?: string;
  type: ReportType;
  title: string;
  
  // Session Information
  sessionDuration: number; // Duration in minutes
  sessionDate: Date;
  
  // AI Analysis Results
  topicsCovered?: string[];
  keyConceptsLearned?: string[];
  comprehensionScore?: number; // 0-100
  focusScore?: number; // 0-100
  productivityScore?: number; // 0-100
  
  // Content Analysis
  materialsCovered?: string[];
  notesQuality?: number; // 0-100
  questionsGenerated?: string[];
  
  // Recommendations
  recommendations?: string[];
  nextSteps?: string[];
  weakAreas?: string[];
  
  // Relations
  subjectId?: string;
  studySessionId?: string;
  focusSessionId?: string;
  readingMaterialId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUploadedNote {
  id?: string;
  title: string;
  content: string;
  type?: string;
  
  // File Information
  fileUrl?: string;
  filePath?: string;
  fileSize?: number;
  
  // AI Validation
  validationStatus?: ValidationStatus;
  comprehensionScore?: number; // 0-100
  completenessScore?: number; // 0-100
  accuracyScore?: number; // 0-100
  
  // AI Feedback
  aiMissing?: string[];
  aiSuggestions?: string[];
  aiFeedback?: string;
  
  // Validation Against Reading Material
  coveragePercentage?: number;
  missingTopics?: string[];
  
  // Relations
  subjectId?: string;
  readingMaterialId?: string;
  studySessionId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILearningStreak {
  id?: string;
  type: StreakType;
  title: string;
  description?: string;
  
  // Streak Data
  currentStreak?: number;
  longestStreak?: number;
  totalDays?: number;
  
  // Goal Configuration
  targetValue?: number;
  targetUnit?: string;
  
  // Dates
  streakStartDate?: Date;
  lastActiveDate?: Date;
  
  // Status
  isActive?: boolean;
  isBroken?: boolean;
  
  // Relations
  subjectId?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStreakEntry {
  id?: string;
  date: Date;
  value: number;
  goalMet?: boolean;
  notes?: string;
  metadata?: any;
  
  streakId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// AI Analysis Interfaces
export interface IAITopicExtraction {
  topics: string[];
  keyPoints: string[];
  difficulty: Difficulty;
  estimatedReadTime: number;
  summary: string;
}

export interface IAIStudyAnalysis {
  topicsCovered: string[];
  keyConceptsLearned: string[];
  comprehensionScore: number;
  focusScore: number;
  productivityScore: number;
  recommendations: string[];
  nextSteps: string[];
  weakAreas: string[];
  questionsGenerated: string[];
}

export interface IAINotesValidation {
  comprehensionScore: number;
  completenessScore: number;
  accuracyScore: number;
  missingTopics: string[];
  suggestions: string[];
  feedback: string;
  coveragePercentage: number;
}

export interface ILearningDashboard {
  overallStats: {
    totalReadingMaterials: number;
    totalStudyReports: number;
    totalNotesUploaded: number;
    averageComprehensionScore: number;
    totalStudyTime: number;
  };
  currentStreaks: ILearningStreak[];
  recentReports: IStudyReport[];
  weeklyProgress: {
    studyHours: number;
    materialsRead: number;
    notesValidated: number;
    averageScores: {
      comprehension: number;
      focus: number;
      productivity: number;
    };
  };
  aiInsights: {
    strongSubjects: string[];
    weakSubjects: string[];
    recommendedFocus: string[];
    learningTrends: string[];
  };
}

// Enums from Prisma
export enum MaterialType {
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  WEBPAGE = 'WEBPAGE',
  TEXT = 'TEXT'
}

export enum UploadStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum ReportType {
  STUDY_SESSION = 'STUDY_SESSION',
  FOCUS_SESSION = 'FOCUS_SESSION',
  READING_SESSION = 'READING_SESSION',
  PRACTICE_SESSION = 'PRACTICE_SESSION'
}

export enum StreakType {
  DAILY_STUDY = 'DAILY_STUDY',
  WEEKLY_GOAL = 'WEEKLY_GOAL',
  MONTHLY_TARGET = 'MONTHLY_TARGET',
  SUBJECT_FOCUS = 'SUBJECT_FOCUS',
  NOTES_VALIDATION = 'NOTES_VALIDATION'
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

// Filter Interfaces
export interface IReadingMaterialFilters {
  type?: MaterialType;
  subjectId?: string;
  uploadStatus?: UploadStatus;
  difficulty?: Difficulty;
  search?: string;
}

export interface IStudyReportFilters {
  type?: ReportType;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  minScore?: number;
}

export interface IUploadedNoteFilters {
  subjectId?: string;
  validationStatus?: ValidationStatus;
  readingMaterialId?: string;
  minScore?: number;
}

export interface ILearningStreakFilters {
  type?: StreakType;
  subjectId?: string;
  isActive?: boolean;
}

// Create/Update Interfaces
export interface IStudyReportCreate {
  type: ReportType;
  title: string;
  sessionDuration: number;
  sessionDate: string; // ISO date string
  subjectId?: string;
  studySessionId?: string;
  focusSessionId?: string;
  readingMaterialId?: string;
}

export interface IUploadedNoteCreate {
  title: string;
  content: string;
  type?: string;
  fileUrl?: string;
  subjectId?: string;
  readingMaterialId?: string;
  studySessionId?: string;
}

export interface ILearningStreakCreate {
  type: StreakType;
  title: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
  subjectId?: string;
}

export interface IStreakEntryCreate {
  date: string; // ISO date string
  value: number;
  goalMet?: boolean;
  notes?: string;
  metadata?: any;
}