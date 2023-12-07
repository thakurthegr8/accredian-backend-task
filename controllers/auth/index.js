const db = require("../../services/db");
const bcrypt = require("bcrypt");
const status = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { pwdSecret } = require("../../constants/auth");

const signupController = async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const data = await db
      .from("users")
      .insert({ ...req.body, password })
      .returning("*");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const signinController = async (req, res) => {
  try {
    const findExists = await db("users")
      .where({ email: req.body.email })
      .select("*");
    if (findExists.length === 0)
      return res
        .status(status.StatusCodes.NOT_FOUND)
        .json({ message: "user not found" });
    const [user] = findExists;
    const { password } = user;
    const checkPassword = await bcrypt.compare(req.body.password, password);
    if (!checkPassword)
      return res
        .status(status.StatusCodes.UNAUTHORIZED)
        .json({ message: "access denied" });
    // if (!user.verified)
    //   return res
    //     .status(status.StatusCodes.FORBIDDEN)
    //     .json({ message: "user is not verified" });
    const accessToken = await jwt.sign(user, pwdSecret, {
      expiresIn: "2 days",
    });
    const refreshToken = await jwt.sign({ email: user.email }, pwdSecret);
    return res.status(status.StatusCodes.OK).json({
      ...user,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

const authTokenController = async (req, res) => {
  try {
    const verifyRefreshToken = await jwt.decode(
      req.body.refresh_token,
      pwdSecret
    );
    if (!verifyRefreshToken)
      return res
        .status(status.StatusCodes.FORBIDDEN)
        .json({ message: "invalid refresh token" });
    const [user] = await db("users").where({
      email: verifyRefreshToken.email,
    });
    const accessToken = await jwt.sign(user, pwdSecret, {
      expiresIn: "2 days",
    });
    const refreshToken = await jwt.sign({ email: user.email }, pwdSecret);
    return res.status(status.StatusCodes.OK).json({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

// const forgotPasswordController = async (req, res) => {
//   try {
//     const findExists = await db("users")
//       .where({ email: req.body.email })
//       .select("*");
//     if (findExists.length === 0)
//       return res
//         .status(status.StatusCodes.NOT_FOUND)
//         .json({ message: "user not found" });
//     const [user] = findExists;
//     const checkPassword = await bcrypt.compare(req.body.current_password, password);
//     if (!checkPassword)
//       return res
//         .status(status.StatusCodes.UNAUTHORIZED)
//         .json({ message: "access denied" });
//   } catch (error) {
//     return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json(error);
//   }
// };

module.exports = { signupController, signinController, authTokenController };
