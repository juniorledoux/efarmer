const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock");
const auth = require("../middleware/auth");

//les routes pour poids
router.get("/all/:vagueId", auth, stockController.showAll);

module.exports = router;
