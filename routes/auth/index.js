const route = require("express").Router();
const {
  signupController,
  signinController,
  authTokenController,
} = require("../../controllers/auth");

route.post("/signup", signupController);
route.post("/signin", signinController);
route.post("/auth-token", authTokenController);

module.exports = route;
