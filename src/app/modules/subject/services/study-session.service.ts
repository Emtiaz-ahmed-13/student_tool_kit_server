import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { getSubjectById } from './subject-crud.service';
import { updateSubjectHours } from '../utils/subject.utils';
import {
  IStudySessionCreate,
  IStudySessionUpdate,
} from '../subject.types';

// Study Session Operations
const createStudySession = async (userId: string, payload: IStudySessionCreate) => {
  // Verify subject belongs to user
  await getSubjectById(userId, payload.subjectId);

  const sessionData = {
    ...payload,
    userId,
    startTime: new Date(payload.startTime),
    endTime: payload.endTime ? new Date(payload.endTime) : undefined,
  };

  // Calculate duration if endTime is provided
  if (sessionData.endTime) {
    const durationMs = sessionData.endTime.getTime() - sessionData.startTime.getTime();
    (sessionData as any).duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }

  const newSession = await prisma.studySession.create({
    data: sessionData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // Update subject's total hours studied
  if ((sessionData as any).duration) {
    await updateSubjectHours(payload.subjectId, (sessionData as any).duration / 60);
  }

  return newSession;
};

const updateStudySession = async (userId: string, sessionId: string, payload: IStudySessionUpdate) => {
  const session = await prisma.studySession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      subject: true,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Study session not found');
  }

  const updateData: any = {
    ...payload,
    endTime: payload.endTime ? new Date(payload.endTime) : undefined,
  };

  // Calculate new duration if endTime is provided
  if (updateData.endTime) {
    const durationMs = updateData.endTime.getTime() - session.startTime.getTime();
    updateData.duration = Math.round(durationMs / (1000 * 60));
  }

  const updatedSession = await prisma.studySession.update({
    where: { id: sessionId },
    data: updateData,
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // Update subject's total hours if duration changed
  if (updateData.duration && updateData.duration !== session.duration) {
    const oldHours = session.duration ? session.duration / 60 : 0;
    const newHours = updateData.duration / 60;
    const hoursDiff = newHours - oldHours;
    await updateSubjectHours(session.subjectId, hoursDiff);
  }

  return updatedSession;
};

const getStudySessions = async (userId: string, filters: any, page = 1, limit = 10) => {
  const where: any = { userId };

  if (filters.subjectId) {
    // Verify subject belongs to user
    await getSubjectById(userId, filters.subjectId);
    where.subjectId = filters.subjectId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  const [sessions, total] = await Promise.all([
    prisma.studySession.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.studySession.count({ where }),
  ]);

  return {
    sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteStudySession = async (userId: string, sessionId: string) => {
  const session = await prisma.studySession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Study session not found');
  }

  await prisma.studySession.delete({
    where: { id: sessionId },
  });

  // Update subject's total hours
  if (session.duration) {
    await updateSubjectHours(session.subjectId, -(session.duration / 60));
  }

  return { message: 'Study session deleted successfully' };
};

export {
  createStudySession,
  updateStudySession,
  getStudySessions,
  deleteStudySession,
};