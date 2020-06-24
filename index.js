const express = require("express");
const formidableMiddleware = require("express-formidable");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

app.use(formidableMiddleware({ multiples: true }));
app.use(cors());
require("dotenv").config();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const userRoutes = require("./routes/user.js");
app.use(userRoutes);
const offerRoutes = require("./routes/offer.js");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.json({ message: "all routes" });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
