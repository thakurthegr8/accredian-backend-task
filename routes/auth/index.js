const route = require("express").Router();
const {
  signupController,
  signinController,
  authTokenController,
  verifyUserController,
  sendVerificationMailController,
} = require("../../controllers/auth");

route.post("/signup", signupController);
route.post("/signin", signinController);
route.post("/auth-token", authTokenController);
route.post("/send-verification", sendVerificationMailController);
route.get("/verify-user", verifyUserController);

module.exports = route;
