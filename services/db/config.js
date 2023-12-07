const dbConfig = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.USER,
    port: 5432,
    password: process.env.DB_PWD,
    database: process.env.DB_DB,
  },
};

module.exports = dbConfig;
