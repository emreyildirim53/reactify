const express = require("express");
const Emoji = require("../models/emoji");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require('../../middlewares/verifyToken');

router.post("/", verifyToken, (req, res, next) => {
  new Emoji({
    _id: new mongoose.Types.ObjectId(),
    code: req.body.code,
    isAnimated: req.body.isAnimated
  }).save()
    .then(result => {
      console.log(result);
      res.status(201).json({message: "Emoji eklendi", eklenenEmoji: result});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.get("/", verifyToken, (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err) => {
    if (err) res.sendStatus(403);
    else {
      Emoji.find()
        .exec()
        .then(docs => {
          console.log(docs);
          res.status(200).json(docs);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    }
  });
});

router.get("/:emojiId", verifyToken, (req, res, next) => {
  Emoji.findById(req.params.emojiId)
    .exec()
    .then(doc => {
      console.log("Veritabanından çekilen emoji: ", doc);
      let docNotFound = {message: "Belirtilen ID'ye sahip bir emoji bulunamadı"};

      doc ?
        res.status(200).json(doc) :
        res.status(404).json(docNotFound);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.patch("/:emojiId", verifyToken, (req, res) => {
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Emoji.update({_id: req.params.emojiId}, {$set: updateOps})
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.delete("/:emojiId", verifyToken, (req, res) => {
  Emoji.remove({_id: req.params.emojiId})
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

module.exports = router;

