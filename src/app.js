/**
 * Express Application Setup
 * ESM-native Express app configuration
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { testConnection, closePool } from './config/database.js';
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { securityHeaders, basicRateLimit } from './middleware/security.js';
import submissionsRouter from './routes/submissions.js';

/**
 * Create and configure Express application
 */
export function createApp() {
  const app = express();

  // Security middleware (first)
  app.use(securityHeaders);
  app.use(basicRateLimit);

  // Request logging (development only)
  app.use(requestLogger);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS middleware
  app.use(cors(config.cors));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '2.0.0-esm',
      uptime: process.uptime()
    });
  });

  // Database connection test endpoint
  app.get('/api/test-db', asyncHandler(async (req, res) => {
    const result = await testConnection();
    
    if (result.success) {
      res.json({
        status: 'Database connected successfully',
        timestamp: result.timestamp,
        postgres_version: result.version,
        pool_stats: {
          total: result.pool_total,
          idle: result.pool_idle,
          waiting: result.pool_waiting
        }
      });
    } else {
      res.status(500).json({
        status: 'Database connection failed',
        error: result.error,
        code: result.code
      });
    }
  }));

  // API info endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Keylight Backend API', 
      version: '2.0.0-esm',
      architecture: 'ESM-native',
      environment: config.nodeEnv,
      endpoints: {
        health: 'GET /health',
        testDb: 'GET /api/test-db',
        submissions: 'GET /api/submissions',
        createSubmission: 'POST /api/submissions',
        submissionStats: 'GET /api/submissions/stats',
        searchSubmissions: 'GET /api/submissions/search',
        submissionById: 'GET /api/submissions/:id',
        updateStatus: 'PUT /api/submissions/:id/status'
      },
      commands: {
        migrations: 'npm run migrate',
        seeds: 'npm run seed',
        dev: 'npm run dev'
      }
    });
  });

  // API routes
  app.use('/api/submissions', submissionsRouter);

  // 404 handler (before error handler)
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;

