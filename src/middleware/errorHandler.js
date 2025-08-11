/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { config } from '../config/environment.js';

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = 500;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  const errorResponse = {
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add error details in development
  if (config.nodeEnv === 'development') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      ...errorResponse,
      error: 'Validation error',
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(err.statusCode).json({
      ...errorResponse,
      error: 'Database error',
      message: config.nodeEnv === 'development' ? err.message : 'Database operation failed'
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      ...errorResponse,
      error: 'Not found',
      message: err.message
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json({
      ...errorResponse,
      error: 'Unauthorized',
      message: err.message
    });
  }

  // Handle PostgreSQL errors
  if (err.code) {
    let message = 'Database error';
    let statusCode = 500;

    switch (err.code) {
      case '23505': // Unique violation
        message = 'Duplicate entry';
        statusCode = 409;
        break;
      case '23503': // Foreign key violation
        message = 'Referenced record not found';
        statusCode = 400;
        break;
      case '23502': // Not null violation
        message = 'Required field missing';
        statusCode = 400;
        break;
      case '42P01': // Table does not exist
        message = 'Database table not found';
        statusCode = 500;
        break;
    }

    return res.status(statusCode).json({
      ...errorResponse,
      error: message,
      message: config.nodeEnv === 'development' ? err.message : message
    });
  }

  // Handle Express validation errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      ...errorResponse,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  // Default 500 error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ...errorResponse,
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;

