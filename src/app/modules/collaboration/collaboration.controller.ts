import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { CollaborationServices } from "./collaboration.service";
import {
  GroupRole,
  INoteFilters,
  IStudyGroupFilters,
} from "./collaboration.types";

// Study Group Controllers
const createStudyGroup = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await CollaborationServices.createStudyGroup(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Study group created successfully",
      data: result,
    });
  }
);

const getStudyGroups = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: IStudyGroupFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await CollaborationServices.getStudyGroups(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study groups retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getStudyGroupById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.getStudyGroupById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study group retrieved successfully",
      data: result,
    });
  }
);

const updateStudyGroup = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.updateStudyGroup(
      userId,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study group updated successfully",
      data: result,
    });
  }
);

const deleteStudyGroup = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.deleteStudyGroup(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Study group deleted successfully",
      data: result,
    });
  }
);

const joinStudyGroup = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { groupId } = req.params;

    const result = await CollaborationServices.joinStudyGroup(userId, groupId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Joined study group successfully",
      data: result,
    });
  }
);

const leaveStudyGroup = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { groupId } = req.params;

    const result = await CollaborationServices.leaveStudyGroup(userId, groupId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Left study group successfully",
      data: result,
    });
  }
);

const updateMemberRole = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { groupId, memberId } = req.params;
    const { role } = req.body;

    const result = await CollaborationServices.updateMemberRole(
      userId,
      groupId,
      memberId,
      role as GroupRole
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Member role updated successfully",
      data: result,
    });
  }
);

// Note Controllers
const createNote = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await CollaborationServices.createNote(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Note created successfully",
      data: result,
    });
  }
);

const getNotes = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: INoteFilters = {
      ...req.query,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
    };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await CollaborationServices.getNotes(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notes retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getNoteById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.getNoteById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Note retrieved successfully",
      data: result,
    });
  }
);

const updateNote = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.updateNote(userId, id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Note updated successfully",
      data: result,
    });
  }
);

const deleteNote = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CollaborationServices.deleteNote(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Note deleted successfully",
      data: result,
    });
  }
);

// Utility Controllers
const getCollaborationStats = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await CollaborationServices.getCollaborationStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Collaboration statistics retrieved successfully",
      data: result,
    });
  }
);

const searchGroups = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { query } = req.query;
    const limit = Number(req.query.limit) || 10;

    if (!query || typeof query !== "string") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Search query is required",
        data: null,
      });
    }

    const result = await CollaborationServices.searchGroups(
      userId,
      query,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Groups search completed successfully",
      data: result,
    });
  }
);

const getPopularTags = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await CollaborationServices.getPopularTags(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Popular tags retrieved successfully",
      data: result,
    });
  }
);

export const CollaborationControllers = {
  createStudyGroup,
  getStudyGroups,
  getStudyGroupById,
  updateStudyGroup,
  deleteStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  updateMemberRole,
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getCollaborationStats,
  searchGroups,
  getPopularTags,
};
