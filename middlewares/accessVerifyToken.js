const jwt = require("jsonwebtoken");
const Token = require("../server/models/auth");

module.exports = function verifyToken(req, res) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  verifyToken();
}

