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

// Utility function for tests that need clean database state
export async function cleanDatabase() {
  // Truncate tables in the correct order to avoid foreign key conflicts
  // Child tables first, then parent tables
  await db.raw('TRUNCATE TABLE "intake_submissions" RESTART IDENTITY CASCADE');
  await db.raw('TRUNCATE TABLE "projects" RESTART IDENTITY CASCADE');
  await db.raw('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
}

export { db };