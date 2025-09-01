import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ClassControllers } from "./class.controller";
import {
  createClassSchema,
  deleteClassSchema,
  getClassesSchema,
  getClassSchema,
  updateClassSchema,
} from "./class.validation";

const router = express.Router();

// Create a new class
router.post(
  "/",
  auth(),
  validateRequest(createClassSchema),
  ClassControllers.createClass
);

// Get all classes with optional filters
router.get(
  "/",
  auth(),
  validateRequest(getClassesSchema),
  ClassControllers.getClasses
);

// Get weekly schedule
router.get("/schedule/weekly", auth(), ClassControllers.getWeeklySchedule);

// Get today's classes
router.get("/schedule/today", auth(), ClassControllers.getTodaysClasses);

// Get upcoming classes
router.get("/schedule/upcoming", auth(), ClassControllers.getUpcomingClasses);

// Get a specific class by ID
router.get(
  "/:id",
  auth(),
  validateRequest(getClassSchema),
  ClassControllers.getClassById
);

// Update a class
router.patch(
  "/:id",
  auth(),
  validateRequest(updateClassSchema),
  ClassControllers.updateClass
);

// Delete a class
router.delete(
  "/:id",
  auth(),
  validateRequest(deleteClassSchema),
  ClassControllers.deleteClass
);

export const ClassRoutes = router;
