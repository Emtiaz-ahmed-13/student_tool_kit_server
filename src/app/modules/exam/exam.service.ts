import ApiError from "../../errors/ApiError";
import prisma from "../../shared/prisma";
import AIQuestionGenerator, { IAIQuestionRequest } from "./ai.service";
import {
  Difficulty,
  IExamQuestionCreate,
  IExamQuestionFilters,
  IExamQuestionUpdate,
  IQuizGeneration,
  IQuizResult,
  IQuizSession,
  QuestionType,
} from "./exam.types";

// In-memory storage for quiz sessions (in production, use Redis or database)
const quizSessions: Map<string, IQuizSession> = new Map();

const createExamQuestion = async (
  userId: string,
  payload: IExamQuestionCreate
) => {
  const questionData = {
    ...payload,
    userId,
    options: payload.options || [],
  };

  const newQuestion = await prisma.examQuestion.create({
    data: questionData,
  });

  return newQuestion;
};

const getExamQuestions = async (
  userId: string,
  filters: IExamQuestionFilters,
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

  if (filters.questionType) {
    where.questionType = filters.questionType;
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty;
  }

  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.examQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.examQuestion.count({ where }),
  ]);

  return {
    data: questions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getExamQuestionById = async (userId: string, questionId: string) => {
  const question = await prisma.examQuestion.findFirst({
    where: {
      id: questionId,
      userId,
    },
  });

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return question;
};

const updateExamQuestion = async (
  userId: string,
  questionId: string,
  payload: IExamQuestionUpdate
) => {
  await getExamQuestionById(userId, questionId);

  const updatedQuestion = await prisma.examQuestion.update({
    where: { id: questionId },
    data: payload,
  });

  return updatedQuestion;
};

const deleteExamQuestion = async (userId: string, questionId: string) => {
  await getExamQuestionById(userId, questionId);

  await prisma.examQuestion.delete({
    where: { id: questionId },
  });

  return { message: "Question deleted successfully" };
};

const generateQuiz = async (userId: string, options: IQuizGeneration) => {
  const where: any = { userId };

  if (options.subject) {
    where.subject = {
      contains: options.subject,
      mode: "insensitive",
    };
  }

  if (options.questionType) {
    where.questionType = options.questionType;
  }

  if (options.difficulty) {
    where.difficulty = options.difficulty;
  }

  const availableQuestions = await prisma.examQuestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (availableQuestions.length === 0) {
    throw new ApiError(404, "No questions found matching the criteria");
  }

  if (availableQuestions.length < options.count) {
    throw new ApiError(
      400,
      `Only ${availableQuestions.length} questions available, but ${options.count} requested`
    );
  }

  const selectedQuestions = availableQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, options.count);

  const sessionId = `quiz_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const quizSession: IQuizSession = {
    id: sessionId,
    questions: selectedQuestions as any,
    userAnswers: {},
    totalQuestions: selectedQuestions.length,
    startTime: new Date(),
  };

  quizSessions.set(sessionId, quizSession);

  const quizForUser = {
    sessionId,
    questions: selectedQuestions.map((q) => ({
      id: q.id,
      subject: q.subject,
      question: q.question,
      questionType: q.questionType,
      difficulty: q.difficulty,
      options: q.options,
    })),
    totalQuestions: selectedQuestions.length,
    startTime: quizSession.startTime,
  };

  return quizForUser;
};

const submitQuiz = async (
  sessionId: string,
  answers: { [questionId: string]: string }
) => {
  const session = quizSessions.get(sessionId);

  if (!session) {
    throw new ApiError(404, "Quiz session not found or expired");
  }

  if (session.endTime) {
    throw new ApiError(400, "Quiz already submitted");
  }

  session.userAnswers = answers;
  session.endTime = new Date();
  session.duration = Math.floor(
    (session.endTime.getTime() - session.startTime.getTime()) / 1000
  );

  let correctAnswers = 0;
  const breakdown = session.questions.map((question) => {
    const userAnswer = answers[question.id!] || "";
    const isCorrect = question.correctAnswer
      ? userAnswer.toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim()
      : false;

    if (isCorrect) correctAnswers++;

    return {
      questionId: question.id!,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer || "",
      isCorrect,
      explanation: question.explanation,
    };
  });

  session.correctAnswers = correctAnswers;
  session.score = Math.round((correctAnswers / session.totalQuestions) * 100);

  const result: IQuizResult = {
    score: session.score,
    totalQuestions: session.totalQuestions,
    correctAnswers,
    wrongAnswers: session.totalQuestions - correctAnswers,
    percentage: session.score,
    duration: session.duration,
    breakdown,
  };

  return result;
};

const getQuizResult = async (sessionId: string) => {
  const session = quizSessions.get(sessionId);

  if (!session) {
    throw new ApiError(404, "Quiz session not found or expired");
  }

  if (!session.endTime) {
    throw new ApiError(400, "Quiz not yet submitted");
  }

  const result: IQuizResult = {
    score: session.score!,
    totalQuestions: session.totalQuestions,
    correctAnswers: session.correctAnswers!,
    wrongAnswers: session.totalQuestions - session.correctAnswers!,
    percentage: session.score!,
    duration: session.duration!,
    breakdown: session.questions.map((question) => {
      const userAnswer = session.userAnswers[question.id!] || "";
      const isCorrect = question.correctAnswer
        ? userAnswer.toLowerCase().trim() ===
          question.correctAnswer.toLowerCase().trim()
        : false;

      return {
        questionId: question.id!,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer || "",
        isCorrect,
        explanation: question.explanation,
      };
    }),
  };

  return result;
};

const getQuestionsBySubject = async (userId: string) => {
  const subjects = await prisma.examQuestion.groupBy({
    by: ["subject"],
    where: { userId },
    _count: { subject: true },
    orderBy: { _count: { subject: "desc" } },
  });

  return subjects.map((item) => ({
    subject: item.subject,
    count: item._count.subject,
  }));
};

const getQuestionStats = async (userId: string) => {
  const [total, byType, byDifficulty, bySubject] = await Promise.all([
    prisma.examQuestion.count({ where: { userId } }),
    prisma.examQuestion.groupBy({
      by: ["questionType"],
      where: { userId },
      _count: { questionType: true },
    }),
    prisma.examQuestion.groupBy({
      by: ["difficulty"],
      where: { userId },
      _count: { difficulty: true },
    }),
    getQuestionsBySubject(userId),
  ]);

  return {
    total,
    byType: byType.map((item) => ({
      type: item.questionType,
      count: item._count.questionType,
    })),
    byDifficulty: byDifficulty.map((item) => ({
      difficulty: item.difficulty,
      count: item._count.difficulty,
    })),
    bySubject,
  };
};

// AI-powered question generation services
const generateQuestionsWithAI = async (
  userId: string,
  request: IAIQuestionRequest
) => {
  try {
    const aiQuestions = await AIQuestionGenerator.generateQuestions(request);

    const savedQuestions = [];
    for (const aiQuestion of aiQuestions) {
      const questionData = {
        subject: request.subject,
        question: aiQuestion.question,
        questionType: aiQuestion.questionType,
        difficulty: aiQuestion.difficulty,
        options: aiQuestion.options || [],
        correctAnswer: aiQuestion.correctAnswer,
        explanation: aiQuestion.explanation,
        userId,
      };

      const savedQuestion = await prisma.examQuestion.create({
        data: questionData,
      });

      savedQuestions.push(savedQuestion);
    }

    return {
      generated: aiQuestions.length,
      saved: savedQuestions.length,
      questions: savedQuestions,
    };
  } catch (error) {
    throw new ApiError(500, `AI Question Generation failed: ${error}`);
  }
};

const generateQuestionsByTopics = async (
  userId: string,
  subject: string,
  topics: string[],
  difficulty: Difficulty
) => {
  try {
    const aiQuestions = await AIQuestionGenerator.generateQuestionsByTopic(
      subject,
      topics,
      difficulty
    );

    const savedQuestions = [];
    for (const aiQuestion of aiQuestions) {
      const questionData = {
        subject,
        question: aiQuestion.question,
        questionType: aiQuestion.questionType,
        difficulty: aiQuestion.difficulty,
        options: aiQuestion.options || [],
        correctAnswer: aiQuestion.correctAnswer,
        explanation: aiQuestion.explanation,
        userId,
      };

      const savedQuestion = await prisma.examQuestion.create({
        data: questionData,
      });

      savedQuestions.push(savedQuestion);
    }

    return {
      topics: topics.length,
      generated: aiQuestions.length,
      saved: savedQuestions.length,
      questions: savedQuestions,
    };
  } catch (error) {
    throw new ApiError(
      500,
      `AI Topic-based Question Generation failed: ${error}`
    );
  }
};

const generateAdaptiveQuiz = async (userId: string, subject: string) => {
  try {
    const performanceData = [
      { difficulty: Difficulty.EASY, correctRate: 0.7 },
      { difficulty: Difficulty.MEDIUM, correctRate: 0.6 },
      { difficulty: Difficulty.HARD, correctRate: 0.4 },
    ];

    const adaptiveQuestions =
      await AIQuestionGenerator.generateAdaptiveQuestions(
        subject,
        performanceData,
        5
      );

    const sessionId = `adaptive_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const quizSession: IQuizSession = {
      id: sessionId,
      questions: adaptiveQuestions as any,
      userAnswers: {},
      totalQuestions: adaptiveQuestions.length,
      startTime: new Date(),
    };

    quizSessions.set(sessionId, quizSession);

    return {
      sessionId,
      questions: adaptiveQuestions.map((q) => ({
        question: q.question,
        questionType: q.questionType,
        difficulty: q.difficulty,
        options: q.options,
      })),
      totalQuestions: adaptiveQuestions.length,
      startTime: quizSession.startTime,
    };
  } catch (error) {
    throw new ApiError(500, `Adaptive Quiz Generation failed: ${error}`);
  }
};

const bulkGenerateQuestions = async (
  userId: string,
  subjects: string[],
  count: number = 5
) => {
  const results = [];

  for (const subject of subjects) {
    try {
      const request: IAIQuestionRequest = {
        subject,
        questionType: QuestionType.MCQ,
        difficulty: Difficulty.MEDIUM,
        count,
      };

      const result = await generateQuestionsWithAI(userId, request);
      results.push({
        subject,
        success: true,
        ...result,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({
        subject,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
};

export const ExamServices = {
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
  // AI-powered functions
  generateQuestionsWithAI,
  generateQuestionsByTopics,
  generateAdaptiveQuiz,
  bulkGenerateQuestions,
};
