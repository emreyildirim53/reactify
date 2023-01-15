const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const authSchema = new mongoose.Schema({
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
    default: Date.now() + (60 * 60 * 1000)
  },
  token: {
    type: String,
    required: true,
    default: function () {
      return jwt.sign({email: this.email}, process.env.JWT_KEY);
    }
  }
});

module.exports = mongoose.model("Auth", authSchema);