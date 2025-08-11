/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { config } from '../config/environment.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  const errorResponse = {
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add error details in development
  if (config.nodeEnv === 'development') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ...errorResponse,
      error: 'Validation error',
      details: err.details
    });
  }

  if (err.name === 'DatabaseError') {
    return res.status(500).json({
      ...errorResponse,
      error: 'Database error'
    });
  }

  // Default 500 error
  res.status(500).json(errorResponse);
}

export default errorHandler;

