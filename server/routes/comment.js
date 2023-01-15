const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Comment = require("../models/comment");

// Comment ekleme
router.post("/", (req, res, next) => {
  const comment = new Comment({
    _id: new mongoose.Types.ObjectId(),
    yaziId: req.body.yaziId,
    commentYapan: req.body.commentYapan,
    commentMetni: req.body.commentMetni
  });
  comment
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Comment eklendi",
        eklenenComment: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Tüm commentları getir
router.get("/", (req, res, next) => {
  Comment.find()
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

// Comment getir (id ile)
router.get("/:commentId", (req, res, next) => {
  const id = req.params.commentId;
  Comment.findById(id)
    .exec()
    .then(doc => {
      console.log("Veritabanından çekilen comment: ", doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "Belirtilen ID'ye sahip bir comment bulunamadı" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// Comment güncelleme
router.patch("/:commentId", (req, res, next) => {
  const id = req.params.commentId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Comment.update({ _id: id}, { $set: updateOps })
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

// Comment silme
router.delete("/:commentId", (req, res, next) => {
  const id = req.params.commentId;
  Comment.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;

