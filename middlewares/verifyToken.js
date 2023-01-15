const jwt = require("jsonwebtoken");
const Token = require("../server/models/auth");

module.exports = function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        Token.findOne({email: authData.email, tokenId: authData.tokenId}, (err, token) => {
          if (err) res.status(500).json({error: "Token kontrol edilirken hata oluştu"});
          else if (!token) res.status(401).json({error: "Token geçersiz"});
          else if (token.expires < Date.now()) {
            res.status(401).json({error: "Auth Token expired"});
          } else {
            req.authData = authData;
            next();
          }
        });
      }
    });
  } else {
    res.sendStatus(403);
  }
}

