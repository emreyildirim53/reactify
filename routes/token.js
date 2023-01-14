const express = require("express");
const Token = require("../models/token");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const verifyToken = require('../middlewares/verifyToken');

router.post("/signup", (req, res, next) => {
  Token.find({email: req.body.email})
    .exec()
    .then(token => {
      if (token.length >= 1) {
        return res.status(409).json({message: "Mail adresi kullanımda"});
      } else {
        const userIdentifier = req.body.email + req.body.password;

        bcrypt.hash(userIdentifier, 10, (err, hash) => {
          if (err) return res.status(500).json({error: err});
          else tokenSave(req, hash, res);
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  Token.find({email: req.body.email})
    .exec()
    .then(userToken => {
      console.log(userToken)
      if (userToken.length < 1) return res.status(401).json({message: "Kullanıcı adı veya şifre yanlış"});

      const userIdentifier = req.body.email + req.body.password;
      bcrypt.compare(userIdentifier, userToken[0].password, (err, result) => {
        if (err) return res.status(401).json({message: "Token hatalı"});

        if (result) tokenUpdate(req, res, userToken);
        else res.status(401).json({message: "Token hatalı"});
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.delete("/", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err)
      res.sendStatus(403);
    else {
      Token.findOneAndUpdate({
        email: authData.email,
        tokenId: authData.tokenId
      }, {$set: {expires: Date.now()}}, (err) => {
        if (err) res.status(500).json({error: "Çıkış yaparken hata oluştu"});
        else res.json({message: "Başarıyla çıkış yapıldı"});
      });
    }
  });
});

router.get("/info", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) res.sendStatus(403);
    else res.json({message: "Token doğrulandı.", authData});
  });
});

function tokenSave(req, hash, res) {
  new Token({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: hash,
    expires: Date.now() + 3600000
  })
    .save()
    .then(result => {
      res.status(201).json({message: "Token oluşturuldu."});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

function tokenUpdate(req, res, userToken) {
  const expires = Date.now() + 3600000;
  Token.findOneAndUpdate({email: req.body.email}, {$set: {expires: expires}}, {new: true}, function (err) {
    if (err) {
      console.log("Token güncellenirken hata oluştu!");
      return res.status(500).json({error: "Token güncellenirken hata oluştu"});
    }
    const token = jwt.sign(
      {
        email: userToken[0].email,
        tokenId: userToken[0]._id,
        expires: expires
      },
      process.env.JWT_KEY,
      {expiresIn: '1h'}
    );
    return res.status(200).json({
      message: "Token doğrulandı",
      token: token
    });
  });
}

module.exports = router;
