const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const User = require("../models/User");

// Create new user

router.post("/user/sign_up", async (req, res) => {
  try {
    const token = uid2(64);
    const salt = uid2(64);
    const hash = SHA256(req.fields.password + salt).toString(encBase64);

    // L'email existe-til déjà dans la BDD ?
    const alreadyExist = await User.findOne({ email: req.fields.email });
    if (alreadyExist) {
      res.json({ message: "email already exist" });
    } else {
      if (req.fields.username && req.fields.email && req.fields.phone) {
        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone
          },
          token: token,
          salt: salt,
          hash: hash
        });
        await newUser.save();

        res.json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account
        });
      } else {
        res.json({ message: "Missing information" });
      }
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Login

router.post("/user/log_in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    if (user) {
      if (
        SHA256(req.fields.password + user.salt).toString(encBase64) ===
        user.hash
      ) {
        res.json({
          _id: user._id,
          token: user.token,
          account: user.account
        });
      } else {
        res.json({ message: "Access denied" });
      }
    } else {
      res.json({ message: "User not found" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
