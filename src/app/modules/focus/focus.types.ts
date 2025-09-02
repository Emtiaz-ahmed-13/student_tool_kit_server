// Enhanced Focus System Types with Famous Methods
export interface IFocusMethod {
  id: string;
  name: string;
  description: string;
  focusDuration: number; // minutes
  breakDuration: number; // minutes
  category: FocusCategory;
  famousFor: string; // What this method is famous for
  scientificBasis?: string; // Scientific backing
  bestFor: string[]; // What subjects/activities it's best for
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export enum FocusCategory {
  POMODORO = "Pomodoro Variations",
  DEEP_WORK = "Deep Work Methods",
  MEDITATION = "Meditation-Based",
  SCIENCE_BACKED = "Science-Backed",
  HABIT_FORMATION = "Habit Formation",
  SUBJECT_SPECIFIC = "Subject-Specific",
}

export interface IFocusHabit {
  id?: string;
  name: string;
  focusMode: FocusMode;
  targetDays: number; // 21, 66, or custom
  focusDuration: number;
  breakDuration: number;
  sessionsPerDay: number;

  // Progress
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  completedDays: number;

  // Status
  isActive: boolean;
  startDate: Date;
  targetDate?: Date;
  completedDate?: Date;

  // Analytics
  averageEffectiveness?: number;
  bestTimeOfDay?: string;

  // Relations
  subjectId?: string;
  userId: string;

  // Habit sessions
  habitSessions?: IFocusHabitSession[];
}

export interface IFocusHabitSession {
  id?: string;
  date: Date;
  completed: boolean;
  effectiveness?: number; // 1-10
  notes?: string;
  plannedSessions: number;
  completedSessions: number;

  habitId: string;
  userId: string;
}

export interface IFocusHabitCreate {
  name: string;
  focusMode: FocusMode;
  targetDays: number;
  focusDuration?: number;
  breakDuration?: number;
  sessionsPerDay?: number;
  subjectId?: string;
}

export interface IFocusHabitProgress {
  habitId: string;
  habitName: string;
  currentStreak: number;
  targetDays: number;
  progressPercentage: number;
  daysRemaining: number;
  isOnTrack: boolean;
  motivation: {
    level: "Low" | "Medium" | "High";
    message: string;
    tips: string[];
  };
  nextMilestone: {
    day: number;
    reward: string;
  };
}

export interface IFocusAnalytics {
  totalHabits: number;
  activeHabits: number;
  completedHabits: number;
  averageStreakLength: number;
  mostSuccessfulMethod: string;
  optimalSessionTime: string;
  weeklyProgress: {
    week: string;
    completedSessions: number;
    targetSessions: number;
    effectiveness: number;
  }[];
  subjectPerformance: {
    subject: string;
    averageEffectiveness: number;
    bestMethod: string;
    totalSessions: number;
  }[];
}

// Famous Focus Methods Configuration
export const FAMOUS_FOCUS_METHODS: IFocusMethod[] = [
  {
    id: "pomodoro-classic",
    name: "Classic Pomodoro",
    description: "The original technique by Francesco Cirillo",
    focusDuration: 25,
    breakDuration: 5,
    category: FocusCategory.POMODORO,
    famousFor:
      "Created by Francesco Cirillo in the 1980s, named after tomato-shaped timer",
    scientificBasis:
      "Based on time-boxing and regular breaks to maintain mental freshness",
    bestFor: [
      "General studying",
      "Task completion",
      "Overcoming procrastination",
    ],
    difficulty: "Beginner",
  },
  {
    id: "pomodoro-extended",
    name: "Extended Pomodoro",
    description: "Longer focus periods for deeper work",
    focusDuration: 50,
    breakDuration: 10,
    category: FocusCategory.POMODORO,
    famousFor: "Popular among programmers and researchers",
    bestFor: ["Programming", "Mathematical problem solving", "Research"],
    difficulty: "Intermediate",
  },
  {
    id: "deep-work-90",
    name: "Cal Newport Deep Work",
    description: "90-minute focused blocks based on ultradian rhythms",
    focusDuration: 90,
    breakDuration: 20,
    category: FocusCategory.DEEP_WORK,
    famousFor: 'Popularized by Cal Newport in "Deep Work"',
    scientificBasis: "Based on natural 90-minute ultradian cycles of alertness",
    bestFor: ["Deep learning", "Creative work", "Complex problem solving"],
    difficulty: "Advanced",
  },
  {
    id: "rule-52-17",
    name: "DeskTime Rule (52:17)",
    description: "Most productive people work 52 minutes, break 17 minutes",
    focusDuration: 52,
    breakDuration: 17,
    category: FocusCategory.SCIENCE_BACKED,
    famousFor: "Based on DeskTime study of most productive 10% of users",
    scientificBasis:
      "Data from millions of users showing optimal work-break ratio",
    bestFor: ["Professional work", "Sustained concentration", "Office tasks"],
    difficulty: "Intermediate",
  },
  {
    id: "mindful-25",
    name: "Mindful Focus 25",
    description: "25-minute mindful concentration with meditation breaks",
    focusDuration: 25,
    breakDuration: 5,
    category: FocusCategory.MEDITATION,
    famousFor: "Combines mindfulness meditation with productivity",
    scientificBasis: "Based on mindfulness research and attention training",
    bestFor: ["Stress reduction", "Attention training", "Mindful learning"],
    difficulty: "Beginner",
  },
  {
    id: "feynman-blocks",
    name: "Feynman Technique Blocks",
    description: "30-minute explanation-focused learning sessions",
    focusDuration: 30,
    breakDuration: 10,
    category: FocusCategory.SUBJECT_SPECIFIC,
    famousFor: "Based on Richard Feynman's learning method",
    scientificBasis: "Teaching/explaining improves understanding and retention",
    bestFor: ["Physics concepts", "Mathematical theorems", "Complex theories"],
    difficulty: "Intermediate",
  },
  {
    id: "active-recall-30",
    name: "Active Recall Sessions",
    description: "30-minute sessions focused on active retrieval practice",
    focusDuration: 30,
    breakDuration: 10,
    category: FocusCategory.SUBJECT_SPECIFIC,
    famousFor: "Based on cognitive science research on retrieval practice",
    scientificBasis:
      "Active recall strengthens memory more than passive review",
    bestFor: ["Exam preparation", "Memory consolidation", "Fact learning"],
    difficulty: "Intermediate",
  },
];

// Habit Formation Rules
export const HABIT_FORMATION_RULES = {
  RULE_21_DAYS: {
    name: "21-Day Habit Rule",
    description: "Popularized by Dr. Maxwell Maltz for simple habits",
    targetDays: 21,
    famousFor: 'From "Psycho-Cybernetics" - minimum time for habit formation',
    bestFor: ["Simple habits", "Daily routines", "Basic study schedules"],
    difficulty: "Beginner",
  },
  RULE_66_DAYS: {
    name: "66-Day Habit Formation",
    description: "Based on UCL research by Dr. Phillippa Lally",
    targetDays: 66,
    famousFor: "Scientific study showing average time for automatic behavior",
    bestFor: [
      "Complex habits",
      "Lifestyle changes",
      "Long-term study routines",
    ],
    difficulty: "Advanced",
  },
  RULE_30_DAYS: {
    name: "30-Day Challenge",
    description: "Popular month-long commitment period",
    targetDays: 30,
    famousFor: "Widely used in self-improvement and fitness",
    bestFor: ["Skill building", "Routine establishment", "Goal achievement"],
    difficulty: "Intermediate",
  },
};

// Subject-specific recommendations for Physics, Math, CS, Chess
export const SUBJECT_FOCUS_RECOMMENDATIONS = {
  PHYSICS: {
    recommendedMethods: ["feynman-blocks", "deep-work-90", "active-recall-30"],
    reasoning: "Physics requires deep understanding and concept explanation",
    habitTarget: 66, // Complex concepts need longer formation
    optimalSessionLength: 45,
  },
  MATHEMATICS: {
    recommendedMethods: [
      "pomodoro-classic",
      "active-recall-30",
      "deep-work-90",
    ],
    reasoning:
      "Math benefits from problem-solving practice and spaced repetition",
    habitTarget: 30,
    optimalSessionLength: 30,
  },
  COMPUTER_SCIENCE: {
    recommendedMethods: ["pomodoro-extended", "deep-work-90", "rule-52-17"],
    reasoning: "Programming requires sustained concentration and debugging",
    habitTarget: 30,
    optimalSessionLength: 50,
  },
  CHESS: {
    recommendedMethods: ["mindful-25", "deep-work-90", "active-recall-30"],
    reasoning: "Chess requires pattern recognition and tactical calculation",
    habitTarget: 21,
    optimalSessionLength: 25,
  },
};

export enum FocusMode {
  // Legacy values - keep for backward compatibility
  POMODORO = "POMODORO", // Original 25 min focus, 5 min break
  DEEP_WORK = "DEEP_WORK", // Original 90 min focus, 20 min break
  CUSTOM = "CUSTOM", // Original user defined
  MARATHON = "MARATHON", // Original extended study session

  // Enhanced Pomodoro Techniques
  POMODORO_CLASSIC = "POMODORO_CLASSIC", // 25 min focus, 5 min break
  POMODORO_EXTENDED = "POMODORO_EXTENDED", // 50 min focus, 10 min break

  // Advanced Deep Work Methods
  DEEP_WORK_90 = "DEEP_WORK_90", // 90 min focus, 20 min break (Cal Newport)
  DEEP_WORK_120 = "DEEP_WORK_120", // 2 hours focus, 30 min break

  // Time-blocking Methods
  TIMEBOXING_45 = "TIMEBOXING_45", // 45 min focused blocks
  TIMEBOXING_60 = "TIMEBOXING_60", // 1 hour focused blocks

  // Famous Productivity Rules
  RULE_52_17 = "RULE_52_17", // 52 min work, 17 min break (DeskTime study)
  RULE_90_20 = "RULE_90_20", // 90 min work, 20 min break (Ultradian rhythm)

  // Meditation-Based Focus
  MINDFUL_25 = "MINDFUL_25", // 25 min mindful focus with meditation breaks
  MINDFUL_45 = "MINDFUL_45", // 45 min mindful focus sessions

  // Study-Specific Methods
  FEYNMAN_BLOCKS = "FEYNMAN_BLOCKS", // 30 min explanation-focused sessions
  ACTIVE_RECALL_30 = "ACTIVE_RECALL_30", // 30 min active recall sessions

  // Habit Formation Support
  HABIT_21_DAYS = "HABIT_21_DAYS", // 21-day consistency tracking
  HABIT_66_DAYS = "HABIT_66_DAYS", // 66-day habit formation cycle
}

// Legacy Focus Mode Mapping
export const LEGACY_FOCUS_MODE_MAPPING = {
  // Map old values to new enhanced equivalents
  [FocusMode.POMODORO]: {
    enhanced: FocusMode.POMODORO_CLASSIC,
    method: FAMOUS_FOCUS_METHODS.find((m) => m.id === "pomodoro-classic"),
    description: "Legacy Pomodoro mapped to Classic Pomodoro",
  },
  [FocusMode.DEEP_WORK]: {
    enhanced: FocusMode.DEEP_WORK_90,
    method: FAMOUS_FOCUS_METHODS.find((m) => m.id === "deep-work-90"),
    description: "Legacy Deep Work mapped to 90-minute Deep Work",
  },
  [FocusMode.CUSTOM]: {
    enhanced: FocusMode.CUSTOM,
    method: null,
    description: "Custom mode remains unchanged",
  },
  [FocusMode.MARATHON]: {
    enhanced: FocusMode.MARATHON,
    method: null,
    description: "Marathon mode remains unchanged",
  },
};

// Function to get enhanced method for legacy mode
export function getLegacyModeMapping(legacyMode: any): {
  enhanced: FocusMode;
  method: IFocusMethod | null | undefined;
  description: string;
} {
  // Cast to any to avoid TypeScript indexing error
  return (
    (LEGACY_FOCUS_MODE_MAPPING as any)[legacyMode as FocusMode] || {
      enhanced: legacyMode as FocusMode,
      method: null,
      description: "No mapping available",
    }
  );
}

// Check if a focus mode is legacy
export function isLegacyFocusMode(mode: any): boolean {
  return [
    FocusMode.POMODORO,
    FocusMode.DEEP_WORK,
    FocusMode.CUSTOM,
    FocusMode.MARATHON,
  ].includes(mode);
}
