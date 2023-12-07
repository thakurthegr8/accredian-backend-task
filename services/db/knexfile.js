const dbConfig = require("./config");

// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    ...dbConfig,
    migrations: {
      directory: "./migrations",
    },
  },
  staging: {
    ...dbConfig,
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    ...dbConfig,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
