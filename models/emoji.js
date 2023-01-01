const mongoose = require("mongoose");

const emojiSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true
  },
  isAnimated: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Emoji", emojiSchema);