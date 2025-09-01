import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ExamServices } from "./exam.service";
import { IExamQuestionFilters, IQuizGeneration } from "./exam.types";

const createExamQuestion = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ExamServices.createExamQuestion(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Exam question created successfully",
      data: result,
    });
  }
);

const getExamQuestions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const filters: IExamQuestionFilters = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await ExamServices.getExamQuestions(
      userId,
      filters,
      page,
      limit
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Exam questions retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getExamQuestionById = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ExamServices.getExamQuestionById(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Exam question retrieved successfully",
      data: result,
    });
  }
);

const updateExamQuestion = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ExamServices.updateExamQuestion(userId, id, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Exam question updated successfully",
      data: result,
    });
  }
);

const deleteExamQuestion = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ExamServices.deleteExamQuestion(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Exam question deleted successfully",
      data: result,
    });
  }
);

const generateQuiz = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const options: IQuizGeneration = req.body;

    const result = await ExamServices.generateQuiz(userId, options);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Quiz generated successfully",
      data: result,
    });
  }
);

const submitQuiz = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { sessionId, answers } = req.body;

    const result = await ExamServices.submitQuiz(sessionId, answers);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Quiz submitted successfully",
      data: result,
    });
  }
);

const getQuizResult = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const { sessionId } = req.params;

    const result = await ExamServices.getQuizResult(sessionId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Quiz result retrieved successfully",
      data: result,
    });
  }
);

const getQuestionsBySubject = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ExamServices.getQuestionsBySubject(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Questions by subject retrieved successfully",
      data: result,
    });
  }
);

const getQuestionStats = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ExamServices.getQuestionStats(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Question statistics retrieved successfully",
      data: result,
    });
  }
);

// AI-powered controller methods
const generateQuestionsWithAI = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const result = await ExamServices.generateQuestionsWithAI(userId, req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "AI questions generated successfully",
      data: result,
    });
  }
);

const generateQuestionsByTopics = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { subject, topics, difficulty } = req.body;

    const result = await ExamServices.generateQuestionsByTopics(
      userId,
      subject,
      topics,
      difficulty
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Topic-based AI questions generated successfully",
      data: result,
    });
  }
);

const generateAdaptiveQuiz = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { subject } = req.body;

    const result = await ExamServices.generateAdaptiveQuiz(userId, subject);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Adaptive quiz generated successfully",
      data: result,
    });
  }
);

const bulkGenerateQuestions = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const userId = req.user.id;
    const { subjects, count } = req.body;

    const result = await ExamServices.bulkGenerateQuestions(
      userId,
      subjects,
      count
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Bulk AI questions generated successfully",
      data: result,
    });
  }
);

export const ExamControllers = {
  createExamQuestion,
  getExamQuestions,
  getExamQuestionById,
  updateExamQuestion,
  deleteExamQuestion,
  generateQuiz,
  submitQuiz,
  getQuizResult,
  getQuestionsBySubject,
  getQuestionStats,
  // AI-powered controllers
  generateQuestionsWithAI,
  generateQuestionsByTopics,
  generateAdaptiveQuiz,
  bulkGenerateQuestions,
};
