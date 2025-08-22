// tests/setup.js
import { beforeAll, afterAll } from 'vitest';
import knex from 'knex';
import config from '../knexfile.mjs';

// Create a new Knex instance for the test database
export const db = knex(config.test);

// Before all tests, run migrations to ensure the schema is up to date
beforeAll(async () => {
  await db.migrate.latest();
});

// After all tests, destroy the database connection
afterAll(async () => {
  await db.destroy();
});

// Enhanced utility function for tests that need clean database state
// Using DELETE instead of TRUNCATE to avoid deadlock issues
export async function cleanDatabase() {
  try {
    // Use DELETE instead of TRUNCATE to avoid table-level locks that cause deadlocks
    // Delete in correct order to avoid foreign key conflicts
    await db('intake_submissions').del();
    await db('projects').del();  
    await db('users').del();
    
    // Note: We don't reset sequences - tests shouldn't depend on specific IDs
    // This is more realistic (production doesn't reset IDs) and avoids FK constraint issues
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}