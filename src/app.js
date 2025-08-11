/**
 * Express Application Setup
 * ESM-native Express app configuration
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { testConnection, closePool } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Create and configure Express application
 */
export function createApp() {
  const app = express();

  // Middleware
  app.use(cors(config.cors));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '2.0.0-esm'
    });
  });

  // Database connection test endpoint
  app.get('/api/test-db', async (req, res) => {
    try {
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
    } catch (error) {
      res.status(500).json({
        status: 'Database test failed',
        error: error.message
      });
    }
  });

  // Basic API info endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Keylight Backend API', 
      version: '2.0.0-esm',
      architecture: 'ESM-native',
      endpoints: {
        health: '/health',
        testDb: '/api/test-db',
        migrations: 'npm run migrate',
        seeds: 'npm run seed'
      }
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });

  return app;
}

export default createApp;

