/**
 * Request Logging Middleware
 * Development-friendly request logging
 */

import { config } from '../config/environment.js';

/**
 * Simple request logger for development
 */
export function requestLogger(req, res, next) {
  // Only log in development
  if (config.nodeEnv !== 'development') {
    return next();
  }

  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request start
  console.log(`📥 ${method} ${url} - ${ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Color code status codes
    let statusColor = '';
    if (statusCode >= 200 && statusCode < 300) {
      statusColor = '\x1b[32m'; // Green
    } else if (statusCode >= 300 && statusCode < 400) {
      statusColor = '\x1b[33m'; // Yellow
    } else if (statusCode >= 400) {
      statusColor = '\x1b[31m'; // Red
    }
    
    console.log(`📤 ${method} ${url} - ${statusColor}${statusCode}\x1b[0m - ${duration}ms`);
    
    // Call original end
    originalEnd.apply(this, args);
  };
  
  next();
}

export default requestLogger;

