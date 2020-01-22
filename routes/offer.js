const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");

// Create an offer

router.post("/offer/publish", async (req, res) => {
  try {
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      created: new Date(),
      creator: req.user
    });
    newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
