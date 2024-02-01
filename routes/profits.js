const express = require("express");
const router = express.Router();
const profitsController = require("../controllers/profits");
const auth = require("../middleware/auth");

router.get("/", auth, profitsController.showAll);
router.get("/rapport", auth, profitsController.showAllForRapport);

module.exports = router;
