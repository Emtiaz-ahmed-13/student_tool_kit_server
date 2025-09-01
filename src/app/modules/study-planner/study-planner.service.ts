import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import {
  IStudyAnalytics,
  IStudyPlanCreate,
  IStudyPlanFilters,
  IStudyPlanUpdate,
  IStudyTaskCreate,
  IStudyTaskUpdate,
  PRIORITY_WEIGHTS,
  TaskStatus,
} from "./study-planner.types";

const createStudyPlan = async (userId: string, payload: IStudyPlanCreate) => {
  const studyPlanData = {
    title: payload.title,
    subject: payload.subject,
    description: payload.description,
    priority: payload.priority,
    status: TaskStatus.PENDING,
    deadline: payload.deadline ? new Date(payload.deadline) : null,
    estimatedHours: payload.estimatedHours,
    userId,
  };

  const result = await prisma.$transaction(async (tx) => {
    // Create the study plan
    const newPlan = await tx.studyPlan.create({
      data: studyPlanData,
    });

    // Create associated tasks if provided
    if (payload.tasks && payload.tasks.length > 0) {
      await tx.studyTask.createMany({
        data: payload.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          studyPlanId: newPlan.id,
        })),
      });
    }

    // Return the plan with tasks
    return await tx.studyPlan.findUnique({
      where: { id: newPlan.id },
      include: { tasks: true },
    });
  });

  return result;
};

const getStudyPlans = async (
  userId: string,
  filters: IStudyPlanFilters,
  page = 1,
  limit = 10
) => {
  const where: any = { userId };

  if (filters.subject) {
    where.subject = {
      contains: filters.subject,
      mode: "insensitive",
    };
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.deadline) {
    where.deadline = {
      lte: new Date(filters.deadline),
    };
  }

  if (filters.upcomingDays) {
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + filters.upcomingDays);
    where.deadline = {
      gte: new Date(),
      lte: upcomingDate,
    };
  }

  const skip = (page - 1) * limit;

  const [studyPlans, total] = await Promise.all([
    prisma.studyPlan.findMany({
      where,
      include: {
        tasks: true,
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: [
        { priority: "desc" },
        { deadline: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    }),
    prisma.studyPlan.count({ where }),
  ]);

  return {
    data: studyPlans,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getStudyPlanById = async (userId: string, planId: string) => {
  const studyPlan = await prisma.studyPlan.findFirst({
    where: {
      id: planId,
      userId,
    },
    include: {
      tasks: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!studyPlan) {
    throw new ApiError(404, "Study plan not found");
  }

  return studyPlan;
};

const updateStudyPlan = async (
  userId: string,
  planId: string,
  payload: IStudyPlanUpdate
) => {
  await getStudyPlanById(userId, planId); // Check if plan exists

  const updateData = { ...payload };
  if (payload.deadline) {
    updateData.deadline = new Date(payload.deadline);
  }

  const updatedPlan = await prisma.studyPlan.update({
    where: { id: planId },
    data: updateData,
    include: { tasks: true },
  });

  return updatedPlan;
};

const deleteStudyPlan = async (userId: string, planId: string) => {
  await getStudyPlanById(userId, planId); // Check if plan exists

  await prisma.studyPlan.delete({
    where: { id: planId },
  });

  return { message: "Study plan deleted successfully" };
};

const createStudyTask = async (
  userId: string,
  planId: string,
  payload: IStudyTaskCreate
) => {
  // Verify the study plan belongs to the user
  await getStudyPlanById(userId, planId);

  const taskData = {
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    studyPlanId: planId,
  };

  const newTask = await prisma.studyTask.create({
    data: taskData,
  });

  return newTask;
};

const updateStudyTask = async (
  userId: string,
  planId: string,
  taskId: string,
  payload: IStudyTaskUpdate
) => {
  // Verify the study plan belongs to the user
  await getStudyPlanById(userId, planId);

  const task = await prisma.studyTask.findFirst({
    where: {
      id: taskId,
      studyPlanId: planId,
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const updateData = { ...payload };
  if (payload.dueDate) {
    updateData.dueDate = new Date(payload.dueDate);
  }

  const updatedTask = await prisma.studyTask.update({
    where: { id: taskId },
    data: updateData,
  });

  // If task is marked as completed, check if all tasks are completed and update plan status
  if (payload.completed !== undefined) {
    const allTasks = await prisma.studyTask.findMany({
      where: { studyPlanId: planId },
    });

    const completedTasks = allTasks.filter((t) => t.completed).length;
    const totalTasks = allTasks.length;

    let newStatus = TaskStatus.PENDING;
    if (completedTasks === totalTasks && totalTasks > 0) {
      newStatus = TaskStatus.COMPLETED;
    } else if (completedTasks > 0) {
      newStatus = TaskStatus.IN_PROGRESS;
    }

    await prisma.studyPlan.update({
      where: { id: planId },
      data: { status: newStatus },
    });
  }

  return updatedTask;
};

const deleteStudyTask = async (
  userId: string,
  planId: string,
  taskId: string
) => {
  // Verify the study plan belongs to the user
  await getStudyPlanById(userId, planId);

  const task = await prisma.studyTask.findFirst({
    where: {
      id: taskId,
      studyPlanId: planId,
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await prisma.studyTask.delete({
    where: { id: taskId },
  });

  return { message: "Task deleted successfully" };
};

const getStudyAnalytics = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
  subject?: string
) => {
  const where: any = { userId };

  if (subject) {
    where.subject = {
      contains: subject,
      mode: "insensitive",
    };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [plans, tasks] = await Promise.all([
    prisma.studyPlan.findMany({
      where,
      include: { tasks: true },
    }),
    prisma.studyTask.findMany({
      where: {
        studyPlan: where,
      },
    }),
  ]);

  const totalPlans = plans.length;
  const completedPlans = plans.filter(
    (p) => p.status === TaskStatus.COMPLETED
  ).length;
  const inProgressPlans = plans.filter(
    (p) => p.status === TaskStatus.IN_PROGRESS
  ).length;
  const pendingPlans = plans.filter(
    (p) => p.status === TaskStatus.PENDING
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  // Subject breakdown
  const subjectMap = new Map<string, { count: number; completed: number }>();
  plans.forEach((plan) => {
    const current = subjectMap.get(plan.subject) || { count: 0, completed: 0 };
    current.count++;
    if (plan.status === TaskStatus.COMPLETED) {
      current.completed++;
    }
    subjectMap.set(plan.subject, current);
  });

  // Priority breakdown
  const priorityMap = new Map<string, number>();
  plans.forEach((plan) => {
    const current = priorityMap.get(plan.priority as string) || 0;
    priorityMap.set(plan.priority as string, current + 1);
  });

  // Upcoming deadlines
  const upcomingDeadlines = await prisma.studyPlan.findMany({
    where: {
      userId,
      deadline: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
      status: { not: TaskStatus.COMPLETED },
    },
    orderBy: { deadline: "asc" },
    take: 5,
  });

  const analytics: IStudyAnalytics = {
    totalPlans,
    completedPlans,
    inProgressPlans,
    pendingPlans,
    completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
    totalTasks,
    completedTasks,
    taskCompletionRate:
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    subjectBreakdown: Array.from(subjectMap.entries()).map(
      ([subject, data]) => ({
        subject,
        count: data.count,
        completed: data.completed,
      })
    ),
    priorityBreakdown: Array.from(priorityMap.entries()).map(
      ([priority, count]) => ({
        priority: priority as any,
        count,
      })
    ),
    upcomingDeadlines: upcomingDeadlines as any,
  };

  return analytics;
};

const getPriorityMatrix = async (userId: string) => {
  const plans = await prisma.studyPlan.findMany({
    where: {
      userId,
      status: { not: TaskStatus.COMPLETED },
    },
    include: { tasks: true },
  });

  // Calculate urgency based on deadline proximity
  const now = new Date();
  const planMatrix = plans.map((plan) => {
    let urgency = 1; // Default low urgency

    if (plan.deadline) {
      const daysUntilDeadline = Math.ceil(
        (plan.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= 1) urgency = 4; // Very urgent
      else if (daysUntilDeadline <= 3) urgency = 3; // Urgent
      else if (daysUntilDeadline <= 7) urgency = 2; // Moderately urgent
    }

    const importance = PRIORITY_WEIGHTS[plan.priority];
    const score = urgency * importance;

    return {
      ...plan,
      urgency,
      importance,
      score,
      recommendation: getRecommendation(urgency, importance),
    };
  });

  return planMatrix.sort((a, b) => b.score - a.score);
};

const getRecommendation = (urgency: number, importance: number): string => {
  if (urgency >= 3 && importance >= 2)
    return "Do First - High priority and urgent";
  if (urgency < 2 && importance >= 2)
    return "Schedule - Important but not urgent";
  if (urgency >= 3 && importance < 2)
    return "Delegate/Quick Action - Urgent but less important";
  return "Eliminate/Later - Neither urgent nor important";
};

const getUpcomingDeadlines = async (userId: string, days = 7) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const upcomingPlans = await prisma.studyPlan.findMany({
    where: {
      userId,
      deadline: {
        gte: new Date(),
        lte: endDate,
      },
      status: { not: TaskStatus.COMPLETED },
    },
    include: { tasks: true },
    orderBy: { deadline: "asc" },
  });

  return upcomingPlans;
};

export const StudyPlannerServices = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
  getStudyAnalytics,
  getPriorityMatrix,
  getUpcomingDeadlines,
};
