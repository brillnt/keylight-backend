/**
 * Keylight Backend Server
 * Modern ESM Node.js application entry point
 */

import { createApp } from './src/app.js';
import { config } from './src/config/environment.js';
import { closePool } from './src/config/database.js';

const app = createApp();
const PORT = config.port;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Keylight Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/api/test-db`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📋 Migrations: npm run migrate`);
  console.log(`🌱 Seed data: npm run seed`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  // Close HTTP server
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connections
    try {
      await closePool();
    } catch (error) {
      console.error('Error closing database pool:', error);
    }
    
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

