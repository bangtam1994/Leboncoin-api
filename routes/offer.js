const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");
const createStripe = require("stripe");
const stripe = createStripe(`sk_test_mC7UweWJYfewD1mjGsDKRG3v00PhVWPvQY`);

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "btngn",
  api_key: "385331586897339",
  api_secret: "h179p9nFdJzq_-FNzMP0Jk0yRmE"
});
// Create an offer
// Need to create a middleWare -->  isAuthenticated

router.post("/publish", isAuthenticated, (req, res) => {
  try {
    const files = req.files.pictures; // files = [ ] mais si 1 photo, files= {}
    // je crée la fonction qui va créer mon offre
    const createNewOffer = async pictures => {
      const newOffer = new Offer({
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        created: new Date(),
        creator: req.user,
        pictures: pictures
      });
      await newOffer.save();
      return res.json({
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
        },
        pictures: newOffer.pictures
      });
    };
    // console.log("Le req.files est:", req.files);
    // console.log("coucou");
    // console.log("Le req.files.path est:", req.files.pictures[0].path);
    // console.log("Le req.files.path est:", req.files.pictures[1].path);

    // Cas 1 : J'ai bien envoyé des photos
    if (typeOf(files) === object) {
      //tableau ou objet
      const results = [];

      if (files.length) {
        // Si j'ai un tableau (donc si j'ai > 2 photos)
        files.forEach(fileKey => {
          cloudinary.uploader.upload(
            fileKey.path,
            {
              folder: "some_folder"
            },
            async (error, result) => {
              if (error) {
                results[fileKey] = {
                  success: false,
                  error: error
                };
              } else {
                results.push(result.secure_url);
              }

              if (results.length === files.length) {
                createNewOffer(results);
              } else {
                return res.send("No file uploaded!");
              }
            }
          );
        });
      } else {
        // Si je n'ai pas de length, donc files est un objet, donc j'ai upload 1 seule photo
        cloudinary.v2.uploader.upload(file.path, (error, result) => {
          if (error) {
            return res.json({ error: `Upload Error` });
          } else {
            results.push(result.secure_url);
            createNewOffer(results);
          }
        });
      }
    } // Cas 2 : 0 photos envoyées
    else {
      createNewOffer([]);
    }
  } catch (error) {
    console.log("Je suis dans le catch");
    res.json({ message: error.message });
  }
});

// router.post("/offer/publish", isAuthenticated, (req, res) => {
//   try {
//     const files = Object.keys(req.files);

//     if (files.length) {
//       const results = {};
//       files.forEach(async fileKey => {
//         cloudinary.v2.uploader.upload(
//           req.files[fileKey].path,
//           {
//             folder: "leboncoin-images"
//           },
//           (error, result) => {
//             // on enregistre le résultat dans un objet
//             if (error) {
//               results[fileKey] = {
//                 success: false,
//                 error: error
//               };
//             } else {
//               results[fileKey] = {
//                 success: true,
//                 result: result
//               };}
//               if (Object.keys(results).length === files.length) {

//               const newOffer = new Offer({
//                 title: req.fields.title,
//                 description: req.fields.description,
//                 price: req.fields.price,
//                 created: new Date(),
//                 creator: req.user,
//                 files: results
//               });
//               await newOffer.save();

//              return res.json({
//                 _id: newOffer.id,
//                 title: newOffer.title,
//                 description: newOffer.description,
//                 price: newOffer.price,
//                 created: newOffer.created,
//                 files: newOffer.files,
//                 creator: {
//                   account: {
//                     username: newOffer.creator.account.username,
//                     phone: newOffer.creator.account.username
//                   },
//                   _id: newOffer.creator._id
//                 }
//             })
//           }
//         );
//       });
//     } else {
//       res.send("No file uploaded");
//     }

//     }
//    catch (error) {
//     res.json({ message: error.message });
//   }
// });

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

// Payment

router.post("/pay", async (req, res) => {
  try {
    // 6. On envoie le token a Stripe avec le montant
    let { status } = await stripe.charges.create({
      amount: 2000, // somme à récupérer dynamiquement depuis le client (Attention, la somme est en centimes)
      currency: "eur",
      description: "An example charge",
      source: req.fields.token
    });
    // 8. Le paiement a fonctionné
    // 9. On peut mettre à jour la base de données
    // 10. On renvoie une réponse au client pour afficher un message de statut
    res.json({ status });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

module.exports = router;
