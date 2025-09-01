import { z } from 'zod';
import { SubjectType, SemesterDuration, FocusMode, SessionStatus } from './subject.types';

// Subject validation schemas
export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
    }).min(1, 'Subject name cannot be empty').max(100, 'Subject name too long'),
    
    code: z.string().max(20, 'Subject code too long').optional(),
    
    type: z.nativeEnum(SubjectType, {
      required_error: 'Subject type is required',
    }),
    
    description: z.string().max(500, 'Description too long').optional(),
    
    credits: z.number().int().min(1).max(20).optional(),
    
    instructor: z.string().max(100, 'Instructor name too long').optional(),
    
    // Semester information (for courses)
    semester: z.string().max(50, 'Semester name too long').optional(),
    
    semesterStart: z.string().datetime().optional(),
    
    semesterEnd: z.string().datetime().optional(),
    
    duration: z.nativeEnum(SemesterDuration).optional(),
    
    // Exam information (for subjects)
    nextExamDate: z.string().datetime().optional(),
    
    examType: z.string().max(50, 'Exam type too long').optional(),
    
    isExamImportant: z.boolean().optional().default(false),
    
    // Study tracking
    targetHoursPerWeek: z.number().min(0.5).max(168).optional(), // Max 168 hours in a week
    
    // Visual
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  }).refine((data) => {
    // If type is COURSE, semester fields should be provided
    if (data.type === SubjectType.COURSE) {
      return data.semester && data.semesterStart && data.semesterEnd && data.duration;
    }
    return true;
  }, {
    message: 'Courses must have semester, start date, end date, and duration',
  }).refine((data) => {
    // If semester dates are provided, start should be before end
    if (data.semesterStart && data.semesterEnd) {
      return new Date(data.semesterStart) < new Date(data.semesterEnd);
    }
    return true;
  }, {
    message: 'Semester start date must be before end date',
  }).refine((data) => {
    // If type is SUBJECT and exam date is provided, it should be in the future
    if (data.type === SubjectType.SUBJECT && data.nextExamDate) {
      return new Date(data.nextExamDate) > new Date();
    }
    return true;
  }, {
    message: 'Exam date must be in the future',
  }),
});

export const updateSubjectSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    }),
  }),
  body: z.object({
    name: z.string().min(1, 'Subject name cannot be empty').max(100, 'Subject name too long').optional(),
    code: z.string().max(20, 'Subject code too long').optional(),
    description: z.string().max(500, 'Description too long').optional(),
    credits: z.number().int().min(1).max(20).optional(),
    instructor: z.string().max(100, 'Instructor name too long').optional(),
    semester: z.string().max(50, 'Semester name too long').optional(),
    semesterStart: z.string().datetime().optional(),
    semesterEnd: z.string().datetime().optional(),
    duration: z.nativeEnum(SemesterDuration).optional(),
    nextExamDate: z.string().datetime().optional(),
    examType: z.string().max(50, 'Exam type too long').optional(),
    isExamImportant: z.boolean().optional(),
    targetHoursPerWeek: z.number().min(0.5).max(168).optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
    isArchived: z.boolean().optional(),
  }).refine((data) => {
    if (data.semesterStart && data.semesterEnd) {
      return new Date(data.semesterStart) < new Date(data.semesterEnd);
    }
    return true;
  }, {
    message: 'Semester start date must be before end date',
  }),
});

export const getSubjectsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(SubjectType).optional(),
    semester: z.string().optional(),
    instructor: z.string().optional(),
    isArchived: z.string().transform((val) => val === 'true').optional(),
    hasUpcomingExam: z.string().transform((val) => val === 'true').optional(),
    search: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const getSubjectSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    }),
  }),
});

export const deleteSubjectSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    }),
  }),
});

// Study Session validation schemas
export const createStudySessionSchema = z.object({
  body: z.object({
    subjectId: z.string({
      required_error: 'Subject ID is required',
    }),
    
    startTime: z.string().datetime({
      message: 'Invalid start time format',
    }),
    
    endTime: z.string().datetime({
      message: 'Invalid end time format',
    }).optional(),
    
    notes: z.string().max(500, 'Notes too long').optional(),
    
    productivity: z.number().int().min(1).max(10).optional(),
  }).refine((data) => {
    if (data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  }, {
    message: 'Start time must be before end time',
  }),
});

export const updateStudySessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Study session ID is required',
    }),
  }),
  body: z.object({
    endTime: z.string().datetime().optional(),
    notes: z.string().max(500, 'Notes too long').optional(),
    productivity: z.number().int().min(1).max(10).optional(),
  }),
});

export const getStudySessionsSchema = z.object({
  query: z.object({
    subjectId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// Focus Session validation schemas
export const createFocusSessionSchema = z.object({
  body: z.object({
    mode: z.nativeEnum(FocusMode, {
      required_error: 'Focus mode is required',
    }),
    
    plannedDuration: z.number().int().min(1).max(480, 'Maximum session duration is 8 hours'),
    
    focusDuration: z.number().int().min(1).max(240).optional(), // For custom mode
    
    breakDuration: z.number().int().min(1).max(60).optional(), // For custom mode
    
    subjectId: z.string().optional(),
    
    notes: z.string().max(500, 'Notes too long').optional(),
  }).refine((data) => {
    // If mode is CUSTOM, focusDuration and breakDuration are required
    if (data.mode === FocusMode.CUSTOM) {
      return data.focusDuration && data.breakDuration;
    }
    return true;
  }, {
    message: 'Custom mode requires focus duration and break duration',
  }),
});

export const updateFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
  body: z.object({
    status: z.nativeEnum(SessionStatus).optional(),
    endTime: z.string().datetime().optional(),
    pausedAt: z.string().datetime().optional(),
    pauseDuration: z.number().int().min(0).optional(),
    notes: z.string().max(500, 'Notes too long').optional(),
    distractions: z.number().int().min(0).optional(),
    effectiveness: z.number().int().min(1).max(10).optional(),
  }),
});

export const getFocusSessionsSchema = z.object({
  query: z.object({
    status: z.nativeEnum(SessionStatus).optional(),
    mode: z.nativeEnum(FocusMode).optional(),
    subjectId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

// Analytics validation schemas
export const getSubjectAnalyticsSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Subject ID is required',
    }),
  }),
  query: z.object({
    period: z.enum(['week', 'month', 'semester', 'year']).optional().default('week'),
  }),
});

export const getTimeTrackingSchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month']).optional().default('week'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    subjectId: z.string().optional(),
  }),
});

// Action validation schemas
export const startFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
});

export const pauseFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
});

export const resumeFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
});

export const completeFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
});

export const cancelFocusSessionSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Focus session ID is required',
    }),
  }),
});