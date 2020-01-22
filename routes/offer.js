const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

// Create an offer
// Need to create a middleWare name isAuthenticated

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      created: new Date(),
      creator: {
        account: {
          username: req.user.account.username
        },
        _id: req.user._id
      }
    });
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
