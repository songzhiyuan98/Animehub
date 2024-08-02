const express = require("express");
const {
  getDailyRecommendations,
  getAnimeById,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorites,
} = require("../controllers/animeController");

const router = express.Router();

router.get("/daily-recommendations", getDailyRecommendations);
router.get("/anime/:id", getAnimeById);
router.get("/favorites/:userId", getFavorites);
router.post("/favorites/add", addToFavorites);
router.post("/favorites/remove", removeFromFavorites);
router.get("/favorites/check/:userId/:animeId", checkFavorites);

module.exports = router;
