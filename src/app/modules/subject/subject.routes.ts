import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import * as subjectController from "./subject.controller";
import {
  cancelFocusSessionSchema,
  completeFocusSessionSchema,
  // Focus session validation schemas
  createFocusSessionSchema,
  // Study session validation schemas
  createStudySessionSchema,
  // Subject validation schemas
  createSubjectSchema,
  deleteSubjectSchema,
  getFocusSessionsSchema,
  getStudySessionsSchema,
  // Analytics validation schemas
  getSubjectAnalyticsSchema,
  getSubjectSchema,
  getSubjectsSchema,
  getTimeTrackingSchema,
  pauseFocusSessionSchema,
  resumeFocusSessionSchema,
  // Action validation schemas
  startFocusSessionSchema,
  updateFocusSessionSchema,
  updateStudySessionSchema,
  updateSubjectSchema,
} from "./subject.validation";

const router = express.Router();

// Subject Routes
router.post(
  "/",
  auth(),
  validateRequest(createSubjectSchema),
  subjectController.createSubject
);

router.get(
  "/",
  auth(),
  validateRequest(getSubjectsSchema),
  subjectController.getSubjects
);

router.get(
  "/:id",
  auth(),
  validateRequest(getSubjectSchema),
  subjectController.getSubject
);

router.patch(
  "/:id",
  auth(),
  validateRequest(updateSubjectSchema),
  subjectController.updateSubject
);

router.delete(
  "/:id",
  auth(),
  validateRequest(deleteSubjectSchema),
  subjectController.deleteSubject
);

// Study Session Routes
router.post(
  "/study-sessions",
  auth(),
  validateRequest(createStudySessionSchema),
  subjectController.createStudySession
);

router.get(
  "/study-sessions",
  auth(),
  validateRequest(getStudySessionsSchema),
  subjectController.getStudySessions
);

router.patch(
  "/study-sessions/:id",
  auth(),
  validateRequest(updateStudySessionSchema),
  subjectController.updateStudySession
);

router.delete(
  "/study-sessions/:id",
  auth(),
  subjectController.deleteStudySession
);

// Focus Session Routes
router.post(
  "/focus-sessions",
  auth(),
  validateRequest(createFocusSessionSchema),
  subjectController.createFocusSession
);

router.get(
  "/focus-sessions",
  auth(),
  validateRequest(getFocusSessionsSchema),
  subjectController.getFocusSessions
);

router.patch(
  "/focus-sessions/:id",
  auth(),
  validateRequest(updateFocusSessionSchema),
  subjectController.updateFocusSession
);

// Focus Session Action Routes
router.post(
  "/focus-sessions/:id/start",
  auth(),
  validateRequest(startFocusSessionSchema),
  subjectController.startFocusSession
);

router.post(
  "/focus-sessions/:id/pause",
  auth(),
  validateRequest(pauseFocusSessionSchema),
  subjectController.pauseFocusSession
);

router.post(
  "/focus-sessions/:id/resume",
  auth(),
  validateRequest(resumeFocusSessionSchema),
  subjectController.resumeFocusSession
);

router.post(
  "/focus-sessions/:id/complete",
  auth(),
  validateRequest(completeFocusSessionSchema),
  subjectController.completeFocusSession
);

router.post(
  "/focus-sessions/:id/cancel",
  auth(),
  validateRequest(cancelFocusSessionSchema),
  subjectController.cancelFocusSession
);

// Analytics Routes
router.get(
  "/:id/analytics",
  auth(),
  validateRequest(getSubjectAnalyticsSchema),
  subjectController.getSubjectAnalytics
);

router.get(
  "/analytics/time-tracking",
  auth(),
  validateRequest(getTimeTrackingSchema),
  subjectController.getTimeTracking
);

// Dashboard Routes
router.get(
  "/dashboard/overview",
  auth(),
  subjectController.getDashboardOverview
);

router.get(
  "/:id/progress",
  auth(),
  validateRequest(getSubjectSchema),
  subjectController.getSubjectProgress
);

export { router as SubjectRoutes };
