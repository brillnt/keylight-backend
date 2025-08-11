/**
 * Express Application Setup
 * ESM-native Express app configuration
 */

import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
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

  // Basic API info endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Keylight Backend API', 
      version: '2.0.0-esm',
      architecture: 'ESM-native',
      endpoints: {
        health: '/health',
        testDb: '/api/test-db'
      }
    });
  });

  // Placeholder for database test endpoint (will be added in next chunk)
  app.get('/api/test-db', (req, res) => {
    res.json({ 
      status: 'Database connection not yet configured',
      message: 'Will be implemented in Chunk 1.2'
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

