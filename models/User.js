const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: { type: String, unique: true },
  token: String,
  hash: String,
  salt: String,
  account: {
    username: { type: String, required: true },
    phone: { type: String },
    birthdate: { type: Date },
  },
});

module.exports = User;
