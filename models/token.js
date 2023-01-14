const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    default: Date.now() + (60 * 60 * 1000) // expires in 1 hour
  }
});

module.exports = mongoose.model("Token", tokenSchema);