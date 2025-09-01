import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import * as subjectCrudService from "../services/subject-crud.service";
import { ISubjectFilters } from "../subject.types";

// Subject CRUD Controllers
const createSubject = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const result = await subjectCrudService.createSubject(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Subject created successfully",
      data: result,
    });
  }
);

const getSubjects = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const filters: ISubjectFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await subjectCrudService.getSubjects(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subjects retrieved successfully",
      meta: result.pagination,
      data: result.subjects,
    });
  }
);

const getSubject = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await subjectCrudService.getSubjectById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subject retrieved successfully",
      data: result,
    });
  }
);

const updateSubject = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await subjectCrudService.updateSubject(userId, id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Subject updated successfully",
      data: result,
    });
  }
);

const deleteSubject = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const result = await subjectCrudService.deleteSubject(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export { createSubject, deleteSubject, getSubject, getSubjects, updateSubject };
