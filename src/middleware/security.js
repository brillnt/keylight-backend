/**
 * Security Middleware
 * Basic security headers and protection
 */

import { config } from '../config/environment.js';

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Only set HSTS in production with HTTPS
  if (config.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

/**
 * Rate limiting placeholder
 * In production, you might want to use express-rate-limit
 */
export function basicRateLimit(req, res, next) {
  // For now, just pass through
  // In production, implement proper rate limiting
  next();
}

/**
 * Request size limiting
 */
export function requestSizeLimit(req, res, next) {
  // Express already handles this with express.json({ limit: '10mb' })
  // This is a placeholder for custom size validation if needed
  next();
}

export default {
  securityHeaders,
  basicRateLimit,
  requestSizeLimit
};

