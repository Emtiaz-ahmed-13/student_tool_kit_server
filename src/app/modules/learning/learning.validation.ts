import { z } from 'zod';
import { 
  MaterialType, 
  UploadStatus, 
  ReportType, 
  StreakType, 
  ValidationStatus, 
  Difficulty 
} from './learning.types';

// Reading Material validation schemas
export const createReadingMaterialSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }).min(1, 'Title cannot be empty').max(200, 'Title too long'),
    
    description: z.string().max(1000, 'Description too long').optional(),
    
    type: z.nativeEnum(MaterialType, {
      required_error: 'Material type is required',
    }),
    
    fileUrl: z.string().url('Invalid file URL').optional(),
    
    subjectId: z.string().optional(),
  }),
});

export const updateReadingMaterialSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Reading material ID is required',
    }),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    subjectId: z.string().optional(),
  }),
});

export const getReadingMaterialsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(MaterialType).optional(),
    subjectId: z.string().optional(),
    uploadStatus: z.nativeEnum(UploadStatus).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    search: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getReadingMaterialSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Reading material ID is required',
    }),
  }),
});

export const deleteReadingMaterialSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Reading material ID is required',
    }),
  }),
});

// Study Report validation schemas
export const createStudyReportSchema = z.object({
  body: z.object({
    type: z.nativeEnum(ReportType, {
      required_error: 'Report type is required',
    }),
    
    title: z.string({
      required_error: 'Title is required',
    }).min(1, 'Title cannot be empty').max(200, 'Title too long'),
    
    sessionDuration: z.number().int().min(1).max(1440, 'Session duration must be between 1 and 1440 minutes'),
    
    sessionDate: z.string().datetime({
      message: 'Invalid session date format',
    }),
    
    subjectId: z.string().optional(),
    studySessionId: z.string().optional(),
    focusSessionId: z.string().optional(),
    readingMaterialId: z.string().optional(),
  }),
});

export const getStudyReportsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(ReportType).optional(),
    subjectId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minScore: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getStudyReportSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Study report ID is required',
    }),
  }),
});

// Uploaded Notes validation schemas
export const createUploadedNoteSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }).min(1, 'Title cannot be empty').max(200, 'Title too long'),
    
    content: z.string({
      required_error: 'Content is required',
    }).min(10, 'Content too short').max(50000, 'Content too long'),
    
    type: z.string().max(50, 'Type too long').optional(),
    
    fileUrl: z.string().url('Invalid file URL').optional(),
    
    subjectId: z.string().optional(),
    readingMaterialId: z.string().optional(),
    studySessionId: z.string().optional(),
  }),
});

export const updateUploadedNoteSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Note ID is required',
    }),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').optional(),
    content: z.string().min(10, 'Content too short').max(50000, 'Content too long').optional(),
    type: z.string().max(50, 'Type too long').optional(),
    subjectId: z.string().optional(),
    readingMaterialId: z.string().optional(),
  }),
});

export const getUploadedNotesSchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    validationStatus: z.nativeEnum(ValidationStatus).optional(),
    readingMaterialId: z.string().optional(),
    minScore: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getUploadedNoteSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Note ID is required',
    }),
  }),
});

// Learning Streak validation schemas
export const createLearningStreakSchema = z.object({
  body: z.object({
    type: z.nativeEnum(StreakType, {
      required_error: 'Streak type is required',
    }),
    
    title: z.string({
      required_error: 'Title is required',
    }).min(1, 'Title cannot be empty').max(100, 'Title too long'),
    
    description: z.string().max(500, 'Description too long').optional(),
    
    targetValue: z.number().min(0.1).max(24).optional(), // Max 24 hours or equivalent
    
    targetUnit: z.string().max(20, 'Target unit too long').optional(),
    
    subjectId: z.string().optional(),
  }),
});

export const updateLearningStreakSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Streak ID is required',
    }),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100, 'Title too long').optional(),
    description: z.string().max(500, 'Description too long').optional(),
    targetValue: z.number().min(0.1).max(24).optional(),
    targetUnit: z.string().max(20, 'Target unit too long').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getLearningStreaksSchema = z.object({
  query: z.object({
    type: z.nativeEnum(StreakType).optional(),
    subjectId: z.string().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getLearningStreakSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Streak ID is required',
    }),
  }),
});

// Streak Entry validation schemas
export const createStreakEntrySchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Streak ID is required',
    }),
  }),
  body: z.object({
    date: z.string().datetime({
      message: 'Invalid date format',
    }),
    
    value: z.number().min(0).max(24, 'Value cannot exceed 24'),
    
    goalMet: z.boolean().optional(),
    
    notes: z.string().max(500, 'Notes too long').optional(),
    
    metadata: z.any().optional(),
  }),
});

export const getStreakEntriesSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Streak ID is required',
    }),
  }),
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// File Upload validation schemas
export const uploadFileSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }).min(1, 'Title cannot be empty').max(200, 'Title too long'),
    
    description: z.string().max(1000, 'Description too long').optional(),
    
    type: z.nativeEnum(MaterialType, {
      required_error: 'Material type is required',
    }),
    
    subjectId: z.string().optional(),
  }),
});

// AI Processing validation schemas
export const processWithAISchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Item ID is required',
    }),
  }),
});

export const validateNotesSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Note ID is required',
    }),
  }),
});

export const generateReportSchema = z.object({
  body: z.object({
    sessionId: z.string({
      required_error: 'Session ID is required',
    }),
    
    sessionType: z.enum(['study', 'focus'], {
      required_error: 'Session type is required',
    }),
    
    readingMaterialIds: z.array(z.string()).optional(),
    
    notesContent: z.string().optional(),
  }),
});

// Analytics validation schemas
export const getLearningAnalyticsSchema = z.object({
  query: z.object({
    period: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
    subjectId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const getDashboardOverviewSchema = z.object({
  query: z.object({
    period: z.enum(['week', 'month']).optional().default('week'),
  }),
});