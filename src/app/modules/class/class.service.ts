import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import {
  DAYS_OF_WEEK,
  IClassCreate,
  IClassFilters,
  IClassUpdate,
  IWeeklySchedule,
} from "./class.types";

const createClass = async (userId: string, payload: IClassCreate) => {
  // Check for time conflicts
  const existingClass = await prisma.class.findFirst({
    where: {
      userId,
      dayOfWeek: payload.dayOfWeek,
      OR: [
        {
          AND: [
            { startTime: { lte: payload.startTime } },
            { endTime: { gt: payload.startTime } },
          ],
        },
        {
          AND: [
            { startTime: { lt: payload.endTime } },
            { endTime: { gte: payload.endTime } },
          ],
        },
        {
          AND: [
            { startTime: { gte: payload.startTime } },
            { endTime: { lte: payload.endTime } },
          ],
        },
      ],
    },
  });

  if (existingClass) {
    throw new ApiError(400, "Time conflict with existing class");
  }

  const newClass = await prisma.class.create({
    data: {
      ...payload,
      userId,
      color: payload.color || "#3B82F6",
    },
  });

  return newClass;
};

const getClasses = async (userId: string, filters: IClassFilters) => {
  const where: any = { userId };

  if (filters.dayOfWeek) {
    where.dayOfWeek = filters.dayOfWeek;
  }

  if (filters.subject) {
    where.subject = {
      contains: filters.subject,
      mode: "insensitive",
    };
  }

  const classes = await prisma.class.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return classes;
};

const getWeeklySchedule = async (userId: string) => {
  const classes = await prisma.class.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const weeklySchedule: IWeeklySchedule = {};

  // Initialize all days
  DAYS_OF_WEEK.forEach((day) => {
    weeklySchedule[day] = [];
  });

  // Group classes by day
  classes.forEach((classItem) => {
    weeklySchedule[classItem.dayOfWeek].push(classItem);
  });

  return weeklySchedule;
};

const getClassById = async (userId: string, classId: string) => {
  const classItem = await prisma.class.findFirst({
    where: {
      id: classId,
      userId,
    },
  });

  if (!classItem) {
    throw new ApiError(404, "Class not found");
  }

  return classItem;
};

const updateClass = async (
  userId: string,
  classId: string,
  payload: IClassUpdate
) => {
  const existingClass = await getClassById(userId, classId);

  // Check for time conflicts if time or day is being updated
  if (payload.startTime || payload.endTime || payload.dayOfWeek) {
    const updatedStartTime = payload.startTime || existingClass.startTime;
    const updatedEndTime = payload.endTime || existingClass.endTime;
    const updatedDayOfWeek = payload.dayOfWeek || existingClass.dayOfWeek;

    const conflictingClass = await prisma.class.findFirst({
      where: {
        userId,
        id: { not: classId },
        dayOfWeek: updatedDayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: updatedStartTime } },
              { endTime: { gt: updatedStartTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: updatedEndTime } },
              { endTime: { gte: updatedEndTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: updatedStartTime } },
              { endTime: { lte: updatedEndTime } },
            ],
          },
        ],
      },
    });

    if (conflictingClass) {
      throw new ApiError(400, "Time conflict with existing class");
    }
  }

  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: payload,
  });

  return updatedClass;
};

const deleteClass = async (userId: string, classId: string) => {
  await getClassById(userId, classId); // Check if class exists

  await prisma.class.delete({
    where: { id: classId },
  });

  return { message: "Class deleted successfully" };
};

const getTodaysClasses = async (userId: string) => {
  const today = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[today.getDay()];

  const todaysClasses = await prisma.class.findMany({
    where: {
      userId,
      dayOfWeek: todayName,
    },
    orderBy: { startTime: "asc" },
  });

  return todaysClasses;
};

const getUpcomingClasses = async (userId: string) => {
  const today = new Date();
  const currentTime = today.toTimeString().slice(0, 5); // HH:MM format
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = dayNames[today.getDay()];

  // Get today's remaining classes
  const todaysRemainingClasses = await prisma.class.findMany({
    where: {
      userId,
      dayOfWeek: todayName,
      startTime: { gte: currentTime },
    },
    orderBy: { startTime: "asc" },
    take: 3,
  });

  // If we need more classes, get from upcoming days
  if (todaysRemainingClasses.length < 3) {
    const remainingCount = 3 - todaysRemainingClasses.length;

    const upcomingDaysClasses = await prisma.class.findMany({
      where: {
        userId,
        dayOfWeek: { not: todayName },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      take: remainingCount,
    });

    return [...todaysRemainingClasses, ...upcomingDaysClasses];
  }

  return todaysRemainingClasses;
};

export const ClassServices = {
  createClass,
  getClasses,
  getWeeklySchedule,
  getClassById,
  updateClass,
  deleteClass,
  getTodaysClasses,
  getUpcomingClasses,
};
