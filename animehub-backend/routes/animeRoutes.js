const express = require("express");
const {
  getDailyRecommendations,
  getAnimeById,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorites,
} = require("../controllers/animeController");
const authenticateToken = require("../middlewares/authenticateToken"); //认证模块导入

const router = express.Router();

router.get("/daily-recommendations", getDailyRecommendations);
router.get("/anime/:id", getAnimeById);
router.get("/favorites/:userId", authenticateToken, getFavorites);
router.post("/favorites/add", authenticateToken, addToFavorites);
router.post("/favorites/remove", authenticateToken, removeFromFavorites);
router.get(
  "/favorites/check/:userId/:animeId",
  authenticateToken,
  checkFavorites
);

module.exports = router;
