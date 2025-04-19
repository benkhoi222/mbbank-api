import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Format error logs for better readability
 */
const formatErrorLog = (err: ApiError, req: Request): string => {
  const method = req.method || 'UNKNOWN';
  const url = req.originalUrl || req.url || 'UNKNOWN';
  const ip = req.ip || req.socket.remoteAddress || 'UNKNOWN';
  const statusCode = err.statusCode || 500;
  const errorName = err.name || 'Error';
  const message = err.message || 'Unknown error';

  return `[ERROR] ${method} ${url} - ${statusCode} ${errorName}: ${message} (IP: ${ip})`;
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  // Log errors in a structured format
  if (err.isOperational) {
    // Operational errors (expected errors like validation errors, auth errors)
    console.log(formatErrorLog(err, req));
  } else {
    // Programming or other unexpected errors - log with stack trace
    console.error(formatErrorLog(err, req));
    if (err.stack) {
      console.error(err.stack);
    }
  }

  // Send response without stack trace for security
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ'
  });
};