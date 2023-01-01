const express = require("express");
const Emoji = require("../models/emoji");
const mongoose = require("mongoose");
const router = express.Router();

// Emoji ekleme
router.post("/", (req, res, next) => {
  new Emoji({
    _id: new mongoose.Types.ObjectId(),
    code: req.body.code,
    isAnimated: req.body.isAnimated
  })
  .save()
  .then(result => {
    console.log(result);
    res.status(201).json({
      message: "Emoji eklendi", eklenenEmoji: result
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
});

// Tüm emoji'leri getir
router.get("/", (req, res, next) => {
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
});

// Emoji getir (id ile)
router.get("/:emojiId", (req, res, next) => {
  const id = req.params.emojiId;
  Emoji.findById(id)
    .exec()
    .then(doc => {
      console.log("Veritabanından çekilen emoji: ", doc);
      let docNotFound = { message: "Belirtilen ID'ye sahip bir emoji bulunamadı" };

      doc ?
        res.status(200).json(doc):
        res.status(404).json(docNotFound);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Emoji güncelleme
router.patch("/:emojiId", (req, res, next) => {
  const id = req.params.emojiId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Emoji.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Emoji silme
router.delete("/:emojiId", (req, res, next) => {
  const id = req.params.emojiId;
  Emoji.remove({ _id: id })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;

