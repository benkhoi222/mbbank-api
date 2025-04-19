/**
 * Lớp ApiError mở rộng Error để chứa thêm thông tin mã trạng thái HTTP
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.isOperational = isOperational; // Operational errors are expected errors

    // Only capture stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Lỗi yêu cầu không hợp lệ (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Yêu cầu không hợp lệ') {
    super(400, message);
  }
}

/**
 * Lỗi không được xác thực (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Không được xác thực') {
    super(401, message);
  }
}

/**
 * Lỗi không có quyền truy cập (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Không có quyền truy cập') {
    super(403, message);
  }
}

/**
 * Lỗi không tìm thấy tài nguyên (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Không tìm thấy tài nguyên') {
    super(404, message);
  }
}

/**
 * Lỗi xung đột tài nguyên (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Xung đột tài nguyên') {
    super(409, message);
  }
}

/**
 * Lỗi máy chủ nội bộ (500)
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Lỗi máy chủ nội bộ') {
    super(500, message);
  }
}

/**
 * Lỗi quá nhiều yêu cầu (429)
 */
export class TooManyRequestsError extends ApiError {
  constructor(message: string = 'Quá nhiều yêu cầu, vui lòng thử lại sau') {
    super(429, message);
  }
}