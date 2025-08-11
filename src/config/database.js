/**
 * Database Configuration
 * ESM-native PostgreSQL connection with pooling
 */

import pkg from 'pg';
const { Pool } = pkg;
import { config } from './environment.js';

/**
 * Database connection pool
 */
let pool = null;

/**
 * Create database connection pool
 */
export function createPool() {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: config.database.url,
    ssl: config.database.ssl,
    // Connection pool settings
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  // Log pool events in development
  if (config.nodeEnv === 'development') {
    pool.on('connect', () => {
      console.log('🔗 New database connection established');
    });

    pool.on('remove', () => {
      console.log('🔌 Database connection removed from pool');
    });
  }

  return pool;
}

/**
 * Get database connection pool
 */
export function getPool() {
  if (!pool) {
    return createPool();
  }
  return pool;
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    return {
      success: true,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].postgres_version,
      pool_total: pool.totalCount,
      pool_idle: pool.idleCount,
      pool_waiting: pool.waitingCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Execute a query with the pool
 */
export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

/**
 * Close database connection pool
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Database connection pool closed');
  }
}

export default {
  createPool,
  getPool,
  testConnection,
  query,
  closePool
};

