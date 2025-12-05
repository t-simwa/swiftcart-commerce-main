import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  
  const errorResponse: {
    success: boolean;
    status: number;
    code: string;
    message: string;
    details?: any;
    stack?: string;
  } = {
    success: false,
    status: statusCode,
    code,
    message: err.message || 'An unexpected error occurred',
  };

  // Add details if available
  if (err.details) {
    errorResponse.details = err.details;
  }

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Log error
  logger.error('API Error', {
    statusCode,
    code,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: ApiError = {
    name: 'NotFound',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    code: 'RESOURCE_NOT_FOUND',
  };
  next(error);
};

export const createError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  details?: any
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

