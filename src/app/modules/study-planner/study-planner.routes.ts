import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { StudyPlannerControllers } from "./study-planner.controller";
import {
  createStudyPlanSchema,
  createStudyTaskSchema,
  deleteStudyPlanSchema,
  deleteStudyTaskSchema,
  getAnalyticsSchema,
  getStudyPlanSchema,
  getStudyPlansSchema,
  updateStudyPlanSchema,
  updateStudyTaskSchema,
} from "./study-planner.validation";

const router = express.Router();

// Create a new study plan
router.post(
  "/",
  auth(),
  validateRequest(createStudyPlanSchema),
  StudyPlannerControllers.createStudyPlan
);

// Get all study plans with optional filters
router.get(
  "/",
  auth(),
  validateRequest(getStudyPlansSchema),
  StudyPlannerControllers.getStudyPlans
);

// Get study analytics
router.get(
  "/analytics",
  auth(),
  validateRequest(getAnalyticsSchema),
  StudyPlannerControllers.getStudyAnalytics
);

// Get priority matrix (Eisenhower Matrix)
router.get(
  "/priority-matrix",
  auth(),
  StudyPlannerControllers.getPriorityMatrix
);

// Get upcoming deadlines
router.get(
  "/upcoming-deadlines",
  auth(),
  StudyPlannerControllers.getUpcomingDeadlines
);

// Get a specific study plan by ID
router.get(
  "/:id",
  auth(),
  validateRequest(getStudyPlanSchema),
  StudyPlannerControllers.getStudyPlanById
);

// Update a study plan
router.patch(
  "/:id",
  auth(),
  validateRequest(updateStudyPlanSchema),
  StudyPlannerControllers.updateStudyPlan
);

// Delete a study plan
router.delete(
  "/:id",
  auth(),
  validateRequest(deleteStudyPlanSchema),
  StudyPlannerControllers.deleteStudyPlan
);

// Create a task for a study plan
router.post(
  "/:planId/tasks",
  auth(),
  validateRequest(createStudyTaskSchema),
  StudyPlannerControllers.createStudyTask
);

// Update a task
router.patch(
  "/:planId/tasks/:taskId",
  auth(),
  validateRequest(updateStudyTaskSchema),
  StudyPlannerControllers.updateStudyTask
);

// Delete a task
router.delete(
  "/:planId/tasks/:taskId",
  auth(),
  validateRequest(deleteStudyTaskSchema),
  StudyPlannerControllers.deleteStudyTask
);

export const StudyPlannerRoutes = router;
