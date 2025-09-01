class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static methods for common errors
  static badRequest(message: string = "Bad Request") {
    return new ApiError(400, message);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Not Found") {
    return new ApiError(404, message);
  }

  static conflict(message: string = "Conflict") {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message: string = "Unprocessable Entity") {
    return new ApiError(422, message);
  }

  static internalServerError(message: string = "Internal Server Error") {
    return new ApiError(500, message);
  }
}

export default ApiError;
