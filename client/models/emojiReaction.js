const mongoose = require("mongoose");

const emojiReactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    id: true
  },
  token: {
    type: String
  },
  emojis: [{
    code: {
      type: String
    },
    clicks: {
      type: Number,
      default: 0
    }
  }]
});

emojiReactionSchema.index({ token: 1, id: 1, 'emojis.code': 1 }, { unique: true });

module.exports = mongoose.model("Emoji-Reaction", emojiReactionSchema);
