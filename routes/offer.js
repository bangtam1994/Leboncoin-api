const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

// Create an offer
// Need to create a middleWare -->  isAuthenticated

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      created: new Date(),
      creator: req.user
    });
    await newOffer.save();
    res.json({
      _id: newOffer.id,
      title: newOffer.title,
      description: newOffer.description,
      price: newOffer.price,
      created: newOffer.created,
      creator: {
        account: {
          username: newOffer.creator.account.username,
          phone: newOffer.creator.account.username
        },
        _id: newOffer.creator._id
      }
    });
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Get a tab with the number of offers + the details of each offer with filters

const searchFilters = req => {
  const filters = {};
  if (req.query.priceMin) {
    filters.price = {};
    filters.price.$gte = req.query.priceMin;
  }
  if (req.query.priceMax) {
    if (filters.price === undefined) {
      filters.price = {};
    }
    filters.price.$lte = req.query.priceMax;
  }
  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i");
  }
  return filters;
};

router.get("/offer/with-count", async (req, res) => {
  try {
    const allOffers = await Offer.find(); //retourne un tableau
    if (allOffers) {
      //Appel de la fonction searchFilters :
      const filters = searchFilters(req);

      // Prépa de la recherche find avec les filters :

      const search2 = await Offer.find(filters);
      const search = Offer.find(filters).populate({
        path: "creator",
        select: "account"
      });
      // Trier les offres par price asc/desc et par date ac/desc

      if (req.query.sort === "price-desc") {
        search.sort({ price: -1 });
      } else if (req.query.sort === "price-asc") {
        search.sort({ price: 1 });
      }
      if (req.query.sort === "date-desc") {
        search.sort({ created: -1 });
      } else if (req.query.sort === "date-asc") {
        search.sort({ created: 1 });
      }

      //Pagination

      if (req.query.page) {
        const page = req.query.page;
        const resultLimit = 3; //Je decide d'afficher maximum 3 articles par page

        search.limit(resultLimit).skip(resultLimit * (page - 1));
      }

      const offers = await search; // Je lance la recherche et je la récupère.

      res.json({
        count: search2.length,
        offers: offers
      });
    } else {
      res.json({ message: "No offers published yet" });
    }
  } catch (error) {
    res.json({ message: error.message });
  }
});

//Avoir les détail d'une annonce par son id

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "creator",
      select: "account"
    });

    res.json(offer);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;
