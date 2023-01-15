const express = require("express");
const Auth = require("../models/auth");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const verifyToken = require('../../middlewares/verifyToken');


router.post("/signup", (req, res, next) => {
  Auth.find({email: req.body.email})
    .exec()
    .then(token => {
      if (token.length >= 1) {
        return res.status(409).json({message: "Mail adresi kullanımda"});
      } else {
        const userIdentifier = req.body.email + req.body.password;

        bcrypt.hash(userIdentifier, 10, (err, hash) => {
          if (err) return res.status(500).json({error: err});
          else authSave(req, hash, res);
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  Auth.find({email: req.body.email})
    .exec()
    .then(userToken => {
      console.log(userToken)
      if (userToken.length < 1) return res.status(401).json({message: "Kullanıcı adı veya şifre yanlış"});

      const userIdentifier = req.body.email + req.body.password;
      bcrypt.compare(userIdentifier, userToken[0].password, (err, result) => {
        if (err) return res.status(401).json({message: "Auth token hatalı"});

        if (result) authUpdate(req, res, userToken);
        else res.status(401).json({message: "Auth token hatalı"});
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.delete("/logout", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err)
      res.sendStatus(403);
    else {
      Auth.findOneAndUpdate({
        email: authData.email,
        tokenId: authData.tokenId
      }, {$set: {expires: Date.now()}}, (err) => {
        if (err) res.status(500).json({error: "Çıkış yaparken hata oluştu"});
        else res.json({message: "Başarıyla çıkış yapıldı"});
      });
    }
  });
});

router.delete("/all", (req, res, next) => {
  Auth.deleteMany({}, (err) => {
    if(err) {
      res.status(500).json({error: err});
    } else {
      res.status(200).json({message: "All Auth records have been deleted."});
    }
  });
});

router.get("/info", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) res.sendStatus(403);
    else res.json({message: "Auth token doğrulandı.", authData});
  });
});

function authSave(req, hash, res) {
  new Auth({
    _id: new mongoose.Types.ObjectId(),
    email: req.body.email,
    password: hash,
    expires: Date.now() + 3600000
  })
    .save()
    .then(() => {
      res.status(201).json({message: "Auth token oluşturuldu."});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
}

function authUpdate(req, res, userToken) {
  const expires = Date.now() + 3600000;
  Auth.findOneAndUpdate({email: req.body.email}, {$set: {expires: expires}}, {new: true}, function (err) {
    if (err) {
      console.log("Auth token güncellenirken hata oluştu!");
      return res.status(500).json({error: "Auth token güncellenirken hata oluştu"});
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
      message: "Auth token doğrulandı",
      token: token
    });
  });
}

module.exports = router;
