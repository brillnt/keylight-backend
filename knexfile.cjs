const path = require("path");

module.exports = {
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
      directory: path.join(__dirname, "database", "knex_migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "database", "seeds"),
    },
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "database", "knex_migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "database", "seeds"),
    },
  },
};

