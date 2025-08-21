/**
 * Environment Configuration
 * ESM-native environment variable handling with validation
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get database configuration based on environment
 */
function getDatabaseConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (nodeEnv === 'test') {
    // Use test database configuration
    return {
      url: 'postgresql://postgres:postgres@localhost:5432/keylight_intake_db_test',
      ssl: false
    };
  }
  
  // Use environment variable for development/production
  return {
    url: process.env.DATABASE_URL,
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false
  };
}

/**
 * Application configuration object
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: getDatabaseConfig(),
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  // Admin configuration
  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL?.split(',') || []
      : [
          'http://localhost:4200',
          'http://localhost:3000', 
          'http://localhost:8080',
          'http://127.0.0.1:5500',
          'http://127.0.0.1:8080',
          'http://localhost:5500'
        ],
    credentials: true
  }
};

// Validate environment on module load
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();
}

export default config;

