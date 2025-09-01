import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { AnalyticsController } from "./analytics.controller";
import {
  getAnalyticsDashboardSchema,
  getLearningCurveSchema,
  getPredictiveAnalysisSchema,
  getStudyPatternsSchema,
  getSubjectAnalyticsSchema,
  getWeaknessAnalysisSchema,
} from "./analytics.validation";

const router = Router();

// Analytics Dashboard - Overview of all analytics
router.get(
  "/dashboard",
  auth(),
  validateRequest(getAnalyticsDashboardSchema),
  AnalyticsController.getDashboard
);

// Learning Curve Analysis - Track improvement over time
router.get(
  "/learning-curve",
  auth(),
  validateRequest(getLearningCurveSchema),
  AnalyticsController.getLearningCurve
);

// Weakness Detection - AI identifies knowledge gaps
router.get(
  "/weaknesses",
  auth(),
  validateRequest(getWeaknessAnalysisSchema),
  AnalyticsController.getWeaknessAnalysis
);

// Study Pattern Optimization - Best times/methods for different subjects
router.get(
  "/study-patterns",
  auth(),
  validateRequest(getStudyPatternsSchema),
  AnalyticsController.getStudyPatterns
);

// Predictive Modeling - Forecast exam performance
router.get(
  "/predictive-analysis",
  auth(),
  validateRequest(getPredictiveAnalysisSchema),
  AnalyticsController.getPredictiveAnalysis
);

// Subject-specific Analytics - Detailed analytics for a specific subject
router.get(
  "/subject/:subjectId",
  auth(),
  validateRequest(getSubjectAnalyticsSchema),
  AnalyticsController.getSubjectAnalytics
);

export const AnalyticsRoutes = router;
