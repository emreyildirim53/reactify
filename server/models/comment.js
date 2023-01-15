const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Comments schema
const CommentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Comment", CommentSchema);