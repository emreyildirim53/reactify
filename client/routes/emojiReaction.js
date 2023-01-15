const express = require("express");
const router = express.Router();
const EmojiReaction = require("../models/emojiReaction");
const Emoji = require("../../server/models/emoji");
const Auth = require('../../server/models/auth')

router.get("/", async (req, res) => {
  try {
    const token = req.headers["access-token"];
    const auth = await Auth.findOne({token});
    if (!auth) {
      return res.status(401).json({message: "Unauthorized"});
    }
    const {code, id} = req.query;

    if (!id) {
      return res.status(400).json({error: "Missing 'id' in query"});
    }
    let emojiReaction;
    if (code) {
      const emojiCodes = code.split(",");
      emojiReaction = await EmojiReaction.findOne({'token': token, 'id': id, 'emojis.code': {$in: emojiCodes}});
    } else {
      emojiReaction = await EmojiReaction.findOne({'token': token, 'id': id});
    }

    if (!emojiReaction) {
      return res.status(404).json({error: "No emoji found with provided id and code"});
    }

    const results = {};
    emojiReaction.emojis.forEach(emoji => {
      results[emoji.code] = emoji.clicks;
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({message: "Internal Server Error"});
  }
});


router.patch("/:id", async (req, res) => {
  try {
    const accessToken = req.headers["access-token"];

    const auth = await Auth.findOne({accessToken});
    if (!auth) {
      return res.status(401).json({message: "Unauthorized"});
    }

    const emoji = await Emoji.findOne({code: req.body.code});
    if (!emoji) {
      return res.status(401).json({error: "Invalid emoji code"});
    }

    let emojiReaction = await EmojiReaction.findOne({token: accessToken, id: req.params.id});
    if (!emojiReaction) {
      emojiReaction = new EmojiReaction({
        token: accessToken,
        id: req.params.id,
        emojis: [{code: emoji.code, clicks: 1}]
      });
      await emojiReaction.save();
    } else {
      let reactedEmoji = emojiReaction.emojis.find(reactedEmoji => reactedEmoji.code === emoji.code);

      if (!reactedEmoji) emojiReaction.emojis.push({code: emoji.code, clicks: 1});
      else reactedEmoji.clicks += 1;

      await emojiReaction.save();
    }

    res.json({message: "Emoji reaction updated", emojiReaction});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

module.exports = router;
