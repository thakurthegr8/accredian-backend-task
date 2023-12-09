const dbConfig = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: 5432,
    password: process.env.DB_PWD,
    database: process.env.DB_DB,
  },
};

console.log(dbConfig);
module.exports = dbConfig;
