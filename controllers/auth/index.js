const db = require("../../services/db");
const bcrypt = require("bcrypt");
const status = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { pwdSecret } = require("../../constants/auth");
const sendMail = require("../../services/mail");
const userTokenVerification = require("../../services/mail/template");

const signupController = async (req, res) => {
  try {
    const findExists = await db("users")
      .where({ email: req.body.email })
      .select("*");
    if (findExists.length !== 0) {
      return res
        .status(status.StatusCodes.NOT_ACCEPTABLE)
        .json({ message: "user already exists" });
    }
    const password = await bcrypt.hash(req.body.password, 10);
    const data = await db
      .from("users")
      .insert({ ...req.body, password })
      .returning("*");
    const [user] = data;
    const accessToken = await jwt.sign({ email: user.email }, pwdSecret);
    const verificationLink = `${process.env.SELF_URL}?token=${accessToken}&redirect_url=${process.env.CLIENT_URL}`;
    const emailResponse = await sendMail(
      userTokenVerification({
        email: user.email,
        to_name: user.first_name,
        message: `Open this link to verify yourself ${verificationLink}`,
      })
    );
    console.log(emailResponse);
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
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
        .json({ message: "unauthorized" });
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
    console.log(error);
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

const verifyUserController = async (req, res) => {
  const { query } = req;
  if (!query?.token && !query?.redirect_url) {
    return res
      .status(status.StatusCodes.BAD_REQUEST)
      .send("missing token or redirect url");
  }
  try {
    const decodedTokenData = await jwt.decode(query.token, pwdSecret);
    const [user] = await db("users")
      .update({ verified: true })
      .where({ email: decodedTokenData.email })
      .returning("*");
    const accessToken = await jwt.sign(user, pwdSecret, {
      expiresIn: "2 days",
    });
    const redirectedUrl = new URL(req.query.redirect_url);
    redirectedUrl.searchParams.set("action", "login");
    redirectedUrl.searchParams.set("token", accessToken);
    return res.redirect(redirectedUrl.href);
  } catch (error) {
    return res.status(status.StatusCodes.BAD_REQUEST).send("an error occurred");
  }
};

const sendVerificationMailController = async (req, res) => {
  const user = req.body;
  try {
    const accessToken = await jwt.sign({ email: user.email }, pwdSecret);
    const verificationLink = `${process.env.SELF_URL}?token=${accessToken}&redirect_url=${process.env.CLIENT_URL}`;
    const emailResponse = await sendMail(
      userTokenVerification({
        email: user.email,
        to_name: user.first_name,
        message: `Open this link to verify yourself ${verificationLink}`,
      })
    );
    return res.status(status.StatusCodes.OK).json({ message: "success" });
  } catch (error) {
    return res.status(status.StatusCodes.BAD_REQUEST).json(error);
  }
};

module.exports = {
  signupController,
  signinController,
  authTokenController,
  verifyUserController,
  sendVerificationMailController,
};
