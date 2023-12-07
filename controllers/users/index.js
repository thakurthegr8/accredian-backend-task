const status = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { pwdSecret } = require("../../constants/auth");
const db = require("../../services/db");


const meController = async (req, res) => {
    try {
      const authTokenPayload = req.headers.authorization;
      const authTokenPayloadTuple = authTokenPayload.split(" ");
      if (authTokenPayloadTuple.length !== 2)
        return res
          .status(status.StatusCodes.UNAUTHORIZED)
          .json({ message: "unauthorized" });
      const [otherTokenAttr, authToken] = authTokenPayloadTuple;
      const decodedAuthTokenData = await jwt.decode(authToken, pwdSecret);
      const [user] = await db("users")
        .where({ email: decodedAuthTokenData.email })
        .select("*");
      return res.status(status.StatusCodes.OK).json(user);
    } catch (error) {
      return res.status(status.StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }

module.exports = {meController}