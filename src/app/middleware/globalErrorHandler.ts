import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails = error;

  // Handle ApiError instances
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = {
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  // Handle Prisma errors
  else if (error.code) {
    // Prisma unique constraint error
    if (error.code === "P2002") {
      statusCode = 400;
      message = "Duplicate entry found";
      errorDetails = {
        field: error.meta?.target,
        message: "A record with this value already exists",
      };
    }
    // Prisma record not found error
    else if (error.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      errorDetails = {
        message: "The requested record could not be found",
      };
    }
  }
  // Handle validation errors (like Zod)
  else if (error.name === "ZodError") {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = {
      issues: error.issues,
      message: "Invalid input data",
    };
  }
  // Handle JWT errors
  else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorDetails = {
      message: "Please provide a valid authentication token",
    };
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorDetails = {
      message: "Your authentication token has expired",
    };
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

export default globalErrorHandler;
