import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import {
  ISubjectCreate,
  ISubjectUpdate,
  ISubjectFilters,
} from '../subject.types';

// Subject CRUD Operations
const createSubject = async (userId: string, payload: ISubjectCreate) => {
  // Check if subject with same name already exists for this user
  const existingSubject = await prisma.subject.findFirst({
    where: {
      userId,
      name: payload.name,
      isArchived: false,
    },
  });

  if (existingSubject) {
    throw new ApiError(400, 'Subject with this name already exists');
  }

  const subjectData = {
    ...payload,
    userId,
    semesterStart: payload.semesterStart ? new Date(payload.semesterStart) : undefined,
    semesterEnd: payload.semesterEnd ? new Date(payload.semesterEnd) : undefined,
    nextExamDate: payload.nextExamDate ? new Date(payload.nextExamDate) : undefined,
  };

  const newSubject = await prisma.subject.create({
    data: subjectData,
  });

  return newSubject;
};

const getSubjects = async (userId: string, filters: ISubjectFilters, page = 1, limit = 10) => {
  const where: any = { userId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.semester) {
    where.semester = {
      contains: filters.semester,
      mode: 'insensitive',
    };
  }

  if (filters.instructor) {
    where.instructor = {
      contains: filters.instructor,
      mode: 'insensitive',
    };
  }

  if (filters.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
  }

  if (filters.hasUpcomingExam) {
    where.nextExamDate = {
      gte: new Date(),
    };
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        code: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      include: {
        _count: {
          select: {
            studySessions: true,
            focusSessions: true,
          },
        },
      },
      orderBy: [
        { isArchived: 'asc' },
        { updatedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    subjects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSubjectById = async (userId: string, subjectId: string) => {
  const subject = await prisma.subject.findFirst({
    where: {
      id: subjectId,
      userId,
    },
    include: {
      _count: {
        select: {
          studySessions: true,
          focusSessions: true,
        },
      },
    },
  });

  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }

  return subject;
};

const updateSubject = async (userId: string, subjectId: string, payload: ISubjectUpdate) => {
  const subject = await getSubjectById(userId, subjectId);

  // Check if name is being changed and doesn't conflict
  if (payload.name && payload.name !== subject.name) {
    const existingSubject = await prisma.subject.findFirst({
      where: {
        userId,
        name: payload.name,
        isArchived: false,
        id: { not: subjectId },
      },
    });

    if (existingSubject) {
      throw new ApiError(400, 'Subject with this name already exists');
    }
  }

  const updateData = {
    ...payload,
    semesterStart: payload.semesterStart ? new Date(payload.semesterStart) : undefined,
    semesterEnd: payload.semesterEnd ? new Date(payload.semesterEnd) : undefined,
    nextExamDate: payload.nextExamDate ? new Date(payload.nextExamDate) : undefined,
  };

  const updatedSubject = await prisma.subject.update({
    where: { id: subjectId },
    data: updateData,
    include: {
      _count: {
        select: {
          studySessions: true,
          focusSessions: true,
        },
      },
    },
  });

  return updatedSubject;
};

const deleteSubject = async (userId: string, subjectId: string) => {
  await getSubjectById(userId, subjectId);

  await prisma.subject.delete({
    where: { id: subjectId },
  });

  return { message: 'Subject deleted successfully' };
};

export {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};