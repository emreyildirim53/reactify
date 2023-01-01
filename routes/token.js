const express = require("express");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res, next) => {
  Token.find({ email: req.body.email })
    .exec()
    .then(token => {
      if (token.length >= 1) {
        return res.status(409).json({ message: "Mail adresi kullanımda" });
      } else {
        const userIdentifier = req.body.email + req.body.password;
        bcrypt.hash(userIdentifier, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            console.log(hash)
            new Token({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            })
            .save()
            .then(result => {
              console.log(result);
              res.status(201).json({ message: "Token oluşturuldu." });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ error: err });
            });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  Token.find({ email: req.body.email })
    .exec()
    .then(userToken => {
      console.log(userToken)
      if (userToken.length < 1) {
        return res.status(401).json({ message: "Böyle bir mail adresi bulunamadı" });
      }
      const userIdentifier = req.body.email + req.body.password;
      bcrypt.compare(userIdentifier, userToken[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: "Token hatalı" });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: userToken[0].email,
              tokenId: userToken[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Token doğrulandı",
            token: token
          });
        }
        res.status(401).json({ message: "Token hatalı" });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/info", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "Token doğrulandı.",
        authData
      });
    }
  });
});

router.delete("/:tokenId", (req, res, next) => {
  Token.remove({ _id: req.params.tokenId })
    .exec()
    .then(() => { res.status(200).json({ message: "Token silindi" }) })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
