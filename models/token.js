const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Token schema
const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  requests: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Token", TokenSchema);