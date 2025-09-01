import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { FocusController } from "./focus.controller";
import {
  completeFocusSessionSchema,
  createFocusHabitSchema,
  deleteFocusHabitSchema,
  getFocusAnalyticsSchema,
  getFocusHabitSchema,
  getFocusHabitsSchema,
  getFocusMethodsSchema,
  getFocusRecommendationsSchema,
  getHabitProgressSchema,
  logHabitSessionSchema,
  pauseFocusSessionSchema,
  startFocusSessionSchema,
  updateFocusHabitSchema,
} from "./focus.validation";

const router = Router();

// Famous Focus Methods & Recommendations
router.get(
  "/methods",
  auth(),
  validateRequest(getFocusMethodsSchema),
  FocusController.getFocusMethods
);

router.get(
  "/recommendations",
  auth(),
  validateRequest(getFocusRecommendationsSchema),
  FocusController.getFocusRecommendations
);

// Focus Habits Management (21-day, 66-day rules, etc.)
router.post(
  "/habits",
  auth(),
  validateRequest(createFocusHabitSchema),
  FocusController.createFocusHabit
);

router.get(
  "/habits",
  auth(),
  validateRequest(getFocusHabitsSchema),
  FocusController.getFocusHabits
);

router.get(
  "/habits/:id",
  auth(),
  validateRequest(getFocusHabitSchema),
  FocusController.getFocusHabit
);

router.put(
  "/habits/:id",
  auth(),
  validateRequest(updateFocusHabitSchema),
  FocusController.updateFocusHabit
);

router.delete(
  "/habits/:id",
  auth(),
  validateRequest(deleteFocusHabitSchema),
  FocusController.deleteFocusHabit
);

// Habit Session Logging
router.post(
  "/habits/:habitId/sessions",
  auth(),
  validateRequest(logHabitSessionSchema),
  FocusController.logHabitSession
);

router.get(
  "/habits/:habitId/progress",
  auth(),
  validateRequest(getHabitProgressSchema),
  FocusController.getHabitProgress
);

// Focus Sessions Management
router.post(
  "/sessions/start",
  auth(),
  validateRequest(startFocusSessionSchema),
  FocusController.startFocusSession
);

router.put(
  "/sessions/:sessionId/complete",
  auth(),
  validateRequest(completeFocusSessionSchema),
  FocusController.completeFocusSession
);

router.put(
  "/sessions/:sessionId/pause",
  auth(),
  validateRequest(pauseFocusSessionSchema),
  FocusController.pauseFocusSession
);

// Analytics
router.get(
  "/analytics",
  auth(),
  validateRequest(getFocusAnalyticsSchema),
  FocusController.getFocusAnalytics
);

// Legacy Data Migration
router.post("/migrate", auth(), FocusController.migrateLegacySessions);

router.get("/legacy-analytics", auth(), FocusController.getLegacyAnalytics);

export const FocusRoutes = router;
