import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { getSubjectById } from './subject-crud.service';
import {
  IFocusSessionCreate,
  IFocusSessionUpdate,
  SessionStatus,
  FocusMode,
  FOCUS_MODE_PRESETS,
} from '../subject.types';

// Focus Session Operations
const createFocusSession = async (userId: string, payload: IFocusSessionCreate) => {
  // Verify subject belongs to user if provided
  if (payload.subjectId) {
    await getSubjectById(userId, payload.subjectId);
  }

  // Set preset durations for non-custom modes
  let sessionData = { ...payload, userId, status: SessionStatus.ACTIVE };

  if (payload.mode !== FocusMode.CUSTOM) {
    const preset = FOCUS_MODE_PRESETS[payload.mode];
    sessionData.focusDuration = preset.focusDuration;
    sessionData.breakDuration = preset.breakDuration;
  }

  const newSession = await prisma.focusSession.create({
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

  return newSession;
};

const updateFocusSession = async (userId: string, sessionId: string, payload: IFocusSessionUpdate) => {
  const session = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Focus session not found');
  }

  const updateData: any = {
    ...payload,
    endTime: payload.endTime ? new Date(payload.endTime) : undefined,
    pausedAt: payload.pausedAt ? new Date(payload.pausedAt) : undefined,
  };

  // Calculate actual duration if session is being completed
  if (payload.status === SessionStatus.COMPLETED && !session.endTime) {
    updateData.endTime = new Date();
    if (session.startTime) {
      const totalMs = updateData.endTime.getTime() - session.startTime.getTime();
      updateData.actualDuration = Math.round(totalMs / (1000 * 60)) - (session.pauseDuration || 0);
    }
  }

  const updatedSession = await prisma.focusSession.update({
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

  return updatedSession;
};

const getFocusSessions = async (userId: string, filters: any, page = 1, limit = 10) => {
  const where: any = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.mode) {
    where.mode = filters.mode;
  }

  if (filters.subjectId) {
    // Verify subject belongs to user
    await getSubjectById(userId, filters.subjectId);
    where.subjectId = filters.subjectId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  const [sessions, total] = await Promise.all([
    prisma.focusSession.findMany({
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
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.focusSession.count({ where }),
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

// Focus Session Actions
const startFocusSession = async (userId: string, sessionId: string) => {
  const session = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Focus session not found');
  }

  if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
    throw new ApiError(400, 'Session cannot be started');
  }

  const updateData: any = {
    status: SessionStatus.ACTIVE,
    startTime: session.startTime || new Date(),
  };

  // If resuming from pause, clear pausedAt
  if (session.status === SessionStatus.PAUSED) {
    updateData.pausedAt = null;
  }

  const updatedSession = await prisma.focusSession.update({
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

  return updatedSession;
};

const pauseFocusSession = async (userId: string, sessionId: string) => {
  const session = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Focus session not found');
  }

  if (session.status !== SessionStatus.ACTIVE) {
    throw new ApiError(400, 'Only active sessions can be paused');
  }

  const updatedSession = await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.PAUSED,
      pausedAt: new Date(),
    },
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

  return updatedSession;
};

const resumeFocusSession = async (userId: string, sessionId: string) => {
  const session = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Focus session not found');
  }

  if (session.status !== SessionStatus.PAUSED) {
    throw new ApiError(400, 'Only paused sessions can be resumed');
  }

  // Calculate pause duration
  let pauseDuration = session.pauseDuration || 0;
  if (session.pausedAt) {
    const pauseMs = new Date().getTime() - session.pausedAt.getTime();
    pauseDuration += Math.round(pauseMs / (1000 * 60));
  }

  const updatedSession = await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      status: SessionStatus.ACTIVE,
      pausedAt: null,
      pauseDuration,
    },
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

  return updatedSession;
};

const completeFocusSession = async (userId: string, sessionId: string) => {
  return await updateFocusSession(userId, sessionId, {
    status: SessionStatus.COMPLETED,
    endTime: new Date().toISOString(),
  });
};

const cancelFocusSession = async (userId: string, sessionId: string) => {
  return await updateFocusSession(userId, sessionId, {
    status: SessionStatus.CANCELLED,
    endTime: new Date().toISOString(),
  });
};

export {
  createFocusSession,
  updateFocusSession,
  getFocusSessions,
  startFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  completeFocusSession,
  cancelFocusSession,
};