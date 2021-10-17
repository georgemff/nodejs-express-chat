const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")
dotenv.config();
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({
      status: 403,
      message: "Empty Token"
    });
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized"
    });
  }
  return next();
};

module.exports = verifyToken;