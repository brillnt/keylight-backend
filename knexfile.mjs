import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  development: {
    client: "pg",
    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "keylight_intake_db",
    },
    migrations: {
      directory: join(__dirname, "database", "knex_migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: join(__dirname, "database", "seeds"),
    },
  },

  test: {
    client: "pg",
    connection: {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "keylight_intake_db_test", // A separate database for testing
    },
    migrations: {
      directory: join(__dirname, "database", "knex_migrations"),
    },
    seeds: {
      directory: join(__dirname, "database", "seeds"),
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: join(__dirname, "database", "knex_migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: join(__dirname, "database", "seeds"),
    },
  },
};

