import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import * as focusSessionService from '../services/focus-session.service';

// Focus Session Controllers
const createFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const result = await focusSessionService.createFocusSession(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Focus session created successfully',
    data: result,
  });
});

const updateFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.updateFocusSession(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session updated successfully',
    data: result,
  });
});

const getFocusSessions = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const filters = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await focusSessionService.getFocusSessions(userId, filters, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus sessions retrieved successfully',
    meta: result.pagination,
    data: result.sessions,
  });
});

// Focus Session Action Controllers
const startFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.startFocusSession(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session started successfully',
    data: result,
  });
});

const pauseFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.pauseFocusSession(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session paused successfully',
    data: result,
  });
});

const resumeFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.resumeFocusSession(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session resumed successfully',
    data: result,
  });
});

const completeFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.completeFocusSession(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session completed successfully',
    data: result,
  });
});

const cancelFocusSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await focusSessionService.cancelFocusSession(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Focus session cancelled successfully',
    data: result,
  });
});

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