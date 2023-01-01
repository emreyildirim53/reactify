const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Token = require("../models/token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  Token.find({ email: req.body.email })
    .exec()
    .then(token => {
      if (token.length >= 1) {
        return res.status(409).json({
          message: "Mail adresi kullanımda"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const token = new Token({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            token
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "Token oluşturuldu"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  Token.find({ email: req.body.email })
    .exec()
    .then(token => {
      if (token.length < 1) {
        return res.status(401).json({
          message: "Böyle bir mail adresi bulunamadı"
        });
      }
      bcrypt.compare(req.body.password, token[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Token hatalı"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: token[0].email,
              tokenId: token[0]._id
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
        res.status(401).json({
          message: "Token hatalı"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:tokenId", (req, res, next) => {
  Token.remove({ _id: req.params.tokenId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Token silindi"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
