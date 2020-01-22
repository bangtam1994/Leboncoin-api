const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  creator: String,
  created: String
});

module.exports = Offer;
