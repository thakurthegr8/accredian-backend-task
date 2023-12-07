const knex = require("knex");
const dbConfig = require("./config");

const db = knex(dbConfig);
db.on("start", () => {
  console.log("connected with database");
});
module.exports = db;
