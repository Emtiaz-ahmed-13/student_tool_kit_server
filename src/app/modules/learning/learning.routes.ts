import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import * as learningController from './learning.controller';
import {
  // Reading Material validation schemas
  createReadingMaterialSchema,
  updateReadingMaterialSchema,
  getReadingMaterialsSchema,
  getReadingMaterialSchema,
  deleteReadingMaterialSchema,
  
  // Study Report validation schemas
  createStudyReportSchema,
  getStudyReportsSchema,
  getStudyReportSchema,
  generateReportSchema,
  
  // Uploaded Notes validation schemas
  createUploadedNoteSchema,
  updateUploadedNoteSchema,
  getUploadedNotesSchema,
  getUploadedNoteSchema,
  
  // Learning Streak validation schemas
  createLearningStreakSchema,
  updateLearningStreakSchema,
  getLearningStreaksSchema,
  getLearningStreakSchema,
  createStreakEntrySchema,
  getStreakEntriesSchema,
  
  // AI Processing validation schemas
  processWithAISchema,
  validateNotesSchema,
  
  // Analytics validation schemas
  getLearningAnalyticsSchema,
  getDashboardOverviewSchema,
} from './learning.validation';

const router = express.Router();

// Reading Material Routes
router.post(
  '/materials',
  auth(),
  validateRequest(createReadingMaterialSchema),
  learningController.createReadingMaterial
);

router.get(
  '/materials',
  auth(),
  validateRequest(getReadingMaterialsSchema),
  learningController.getReadingMaterials
);

router.get(
  '/materials/:id',
  auth(),
  validateRequest(getReadingMaterialSchema),
  learningController.getReadingMaterial
);

router.patch(
  '/materials/:id',
  auth(),
  validateRequest(updateReadingMaterialSchema),
  learningController.updateReadingMaterial
);

router.delete(
  '/materials/:id',
  auth(),
  validateRequest(deleteReadingMaterialSchema),
  learningController.deleteReadingMaterial
);

// AI Processing for Reading Materials
router.post(
  '/materials/:id/process-ai',
  auth(),
  validateRequest(processWithAISchema),
  learningController.processWithAI
);

// Study Report Routes
router.post(
  '/reports',
  auth(),
  validateRequest(createStudyReportSchema),
  learningController.createStudyReport
);

router.get(
  '/reports',
  auth(),
  validateRequest(getStudyReportsSchema),
  learningController.getStudyReports
);

router.get(
  '/reports/:id',
  auth(),
  validateRequest(getStudyReportSchema),
  learningController.getStudyReport
);

// Generate Session Report (automatically triggered after sessions)
router.post(
  '/reports/generate',
  auth(),
  validateRequest(generateReportSchema),
  learningController.generateSessionReport
);

// Uploaded Notes Routes
router.post(
  '/notes',
  auth(),
  validateRequest(createUploadedNoteSchema),
  learningController.createUploadedNote
);

router.get(
  '/notes',
  auth(),
  validateRequest(getUploadedNotesSchema),
  learningController.getUploadedNotes
);

router.get(
  '/notes/:id',
  auth(),
  validateRequest(getUploadedNoteSchema),
  learningController.getUploadedNote
);

// AI Validation for Notes
router.post(
  '/notes/:id/validate',
  auth(),
  validateRequest(validateNotesSchema),
  learningController.validateNotes
);

// Learning Streak Routes
router.post(
  '/streaks',
  auth(),
  validateRequest(createLearningStreakSchema),
  learningController.createLearningStreak
);

router.get(
  '/streaks',
  auth(),
  validateRequest(getLearningStreaksSchema),
  learningController.getLearningStreaks
);

// Add Streak Entry
router.post(
  '/streaks/:id/entries',
  auth(),
  validateRequest(createStreakEntrySchema),
  learningController.addStreakEntry
);

// Analytics and Dashboard Routes
router.get(
  '/dashboard',
  auth(),
  validateRequest(getDashboardOverviewSchema),
  learningController.getLearningDashboard
);

router.get(
  '/analytics',
  auth(),
  validateRequest(getLearningAnalyticsSchema),
  learningController.getLearningAnalytics
);

// Gamification Routes
router.get(
  '/ranking',
  auth(),
  learningController.getUserRanking
);

router.get(
  '/leaderboard',
  auth(),
  learningController.getLeaderboard
);

// AI-Powered Features
router.get(
  '/recommendations',
  auth(),
  learningController.getStudyRecommendations
);

router.get(
  '/questions/personalized',
  auth(),
  learningController.getPersonalizedQuestions
);

// File Upload Routes (these would typically use multer middleware)
router.post(
  '/upload/material',
  auth(),
  // multer().single('file'), // This would be added for actual file upload
  learningController.createReadingMaterial
);

router.post(
  '/upload/notes',
  auth(),
  // multer().single('file'), // This would be added for actual file upload
  learningController.createUploadedNote
);

// Webhook Routes (for AI processing callbacks)
router.post(
  '/webhooks/ai-processing',
  // validateWebhookSignature middleware would go here
  async (req, res) => {
    // Handle AI processing completion callbacks
    res.status(200).json({ received: true });
  }
);

// Bulk Operations
router.post(
  '/materials/bulk-process',
  auth(),
  async (req, res) => {
    // Bulk process multiple materials with AI
    res.status(200).json({ message: 'Bulk processing started' });
  }
);

router.post(
  '/reports/bulk-generate',
  auth(),
  async (req, res) => {
    // Generate reports for multiple sessions
    res.status(200).json({ message: 'Bulk report generation started' });
  }
);

// Export/Import Routes
router.get(
  '/export/reports',
  auth(),
  async (req, res) => {
    // Export study reports as CSV/PDF
    res.status(200).json({ exportUrl: 'https://example.com/export.csv' });
  }
);

router.get(
  '/export/streaks',
  auth(),
  async (req, res) => {
    // Export streak data
    res.status(200).json({ exportUrl: 'https://example.com/streaks.csv' });
  }
);

// Statistics Routes
router.get(
  '/stats/overview',
  auth(),
  async (req, res) => {
    // Get overview statistics
    res.status(200).json({
      totalMaterials: 0,
      totalReports: 0,
      totalNotes: 0,
      activeStreaks: 0,
    });
  }
);

router.get(
  '/stats/performance',
  auth(),
  async (req, res) => {
    // Get performance statistics
    res.status(200).json({
      averageComprehension: 0,
      averageFocus: 0,
      averageProductivity: 0,
      improvementTrend: 'positive',
    });
  }
);

export { router as LearningRoutes };