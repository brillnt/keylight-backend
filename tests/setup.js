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

// Enhanced database cleanup with proper foreign key handling
export async function cleanDatabase() {
  try {
    // Use a single transaction for all cleanup operations to ensure atomicity
    await db.transaction(async (trx) => {
      // Delete in correct order to avoid foreign key conflicts
      await trx('intake_submissions').del();
      await trx('projects').del();
      await trx('users').del();
    });
    
    // Note: We don't reset sequences - tests shouldn't depend on specific IDs
    // This is more realistic (production doesn't reset IDs) and avoids FK constraint issues
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}