const express = require("express");
const router = express.Router();
const recyclageAlimentController = require("../controllers/donnees/recyclage_aliment");
const auth = require("../middleware/auth");

router.post("/:vagueId", auth, recyclageAlimentController.recycler);

module.exports = router;
