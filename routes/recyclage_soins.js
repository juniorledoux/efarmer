const express = require("express");
const router = express.Router();
const recyclageSoinsController = require("../controllers/donnees/recyclage_soins");
const auth = require("../middleware/auth");

router.post("/:vagueId", auth, recyclageSoinsController.recycler);

module.exports = router;
