import express from "express";
import testRoutes from "../../test-routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { BudgetRoutes } from "../modules/budget/budget.routes";
import { ClassRoutes } from "../modules/class/class.routes";
import { CollaborationRoutes } from "../modules/collaboration/collaboration.routes";
import { ExamRoutes } from "../modules/exam/exam.routes";
import { FocusRoutes } from "../modules/focus/focus.routes";
import { LearningRoutes } from "../modules/learning/learning.routes";
import { StudyPlannerRoutes } from "../modules/study-planner/study-planner.routes";
import { SubjectRoutes } from "../modules/subject/subject.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/classes",
    route: ClassRoutes,
  },
  {
    path: "/budget",
    route: BudgetRoutes,
  },
  {
    path: "/exams",
    route: ExamRoutes,
  },
  {
    path: "/study-planner",
    route: StudyPlannerRoutes,
  },
  {
    path: "/collaboration",
    route: CollaborationRoutes,
  },
  {
    path: "/subjects",
    route: SubjectRoutes,
  },
  {
    path: "/learning",
    route: LearningRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
  {
    path: "/focus",
    route: FocusRoutes,
  },
  {
    path: "/test",
    route: testRoutes,
  },
];

// Add logging to see which routes are being registered
if (process.env.NODE_ENV === "development") {
  console.log("Registering API routes:");
  moduleRoutes.forEach((route) => {
    console.log(`  ${route.path}`);
  });
}

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
