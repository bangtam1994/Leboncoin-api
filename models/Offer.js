const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  created: Date,
  creator: Object
});

module.exports = Offer;
