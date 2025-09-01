import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ExamControllers } from "./exam.controller";
import {
  bulkGenerateQuestionsSchema,
  createExamQuestionSchema,
  deleteExamQuestionSchema,
  generateAdaptiveQuizSchema,
  generateAIQuestionsSchema,
  generateQuestionsByTopicsSchema,
  generateQuizSchema,
  getExamQuestionSchema,
  getExamQuestionsSchema,
  getQuizResultSchema,
  submitQuizSchema,
  updateExamQuestionSchema,
} from "./exam.validation";

const router = express.Router();

// Create a new exam question
router.post(
  "/questions",
  auth(),
  validateRequest(createExamQuestionSchema),
  ExamControllers.createExamQuestion
);

// Get all exam questions with optional filters
router.get(
  "/questions",
  auth(),
  validateRequest(getExamQuestionsSchema),
  ExamControllers.getExamQuestions
);

// Get questions grouped by subject
router.get(
  "/questions/subjects",
  auth(),
  ExamControllers.getQuestionsBySubject
);

// Get question statistics
router.get("/questions/stats", auth(), ExamControllers.getQuestionStats);

// Get a specific exam question by ID
router.get(
  "/questions/:id",
  auth(),
  validateRequest(getExamQuestionSchema),
  ExamControllers.getExamQuestionById
);

// Update an exam question
router.patch(
  "/questions/:id",
  auth(),
  validateRequest(updateExamQuestionSchema),
  ExamControllers.updateExamQuestion
);

// Delete an exam question
router.delete(
  "/questions/:id",
  auth(),
  validateRequest(deleteExamQuestionSchema),
  ExamControllers.deleteExamQuestion
);

// Generate a quiz
router.post(
  "/quiz/generate",
  auth(),
  validateRequest(generateQuizSchema),
  ExamControllers.generateQuiz
);

// Submit quiz answers
router.post(
  "/quiz/submit",
  auth(),
  validateRequest(submitQuizSchema),
  ExamControllers.submitQuiz
);

// Get quiz result
router.get(
  "/quiz/result/:sessionId",
  auth(),
  validateRequest(getQuizResultSchema),
  ExamControllers.getQuizResult
);

// AI-powered question generation routes
// Generate questions with AI
router.post(
  "/ai/generate",
  auth(),
  validateRequest(generateAIQuestionsSchema),
  ExamControllers.generateQuestionsWithAI
);

// Generate questions by topics with AI
router.post(
  "/ai/generate-by-topics",
  auth(),
  validateRequest(generateQuestionsByTopicsSchema),
  ExamControllers.generateQuestionsByTopics
);

// Generate adaptive quiz with AI
router.post(
  "/ai/adaptive-quiz",
  auth(),
  validateRequest(generateAdaptiveQuizSchema),
  ExamControllers.generateAdaptiveQuiz
);

// Bulk generate questions with AI
router.post(
  "/ai/bulk-generate",
  auth(),
  validateRequest(bulkGenerateQuestionsSchema),
  ExamControllers.bulkGenerateQuestions
);

export const ExamRoutes = router;
