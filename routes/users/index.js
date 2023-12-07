const { meController } = require("../../controllers/users");

const route = require("express").Router();

route.post("/me", meController);

module.exports = route;
