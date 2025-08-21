// tests/setup.js
import { beforeAll, afterAll, beforeEach } from 'vitest';
import knex from 'knex';
import config from '../knexfile.mjs';

// Create a new Knex instance for the test database
const db = knex(config.test);

// Before all tests, run migrations to ensure the schema is up to date
beforeAll(async () => {
  await db.migrate.latest();
});

// After each test, truncate all tables to ensure a clean state
beforeEach(async () => {
  const tables = await db.raw("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  for (const table of tables.rows) {
    if (table.tablename !== 'knex_migrations' && table.tablename !== 'knex_migrations_lock') {
      await db.raw(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`);
    }
  }
});

// After all tests, destroy the database connection
afterAll(async () => {
  await db.destroy();
});

export { db };