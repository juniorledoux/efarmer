const express = require("express");
const router = express.Router();
const rapportVagueController = require("../../controllers/rapports/rapportVague");
const auth = require("../../middleware/auth");


router.post("/", auth, rapportVagueController.createRapportVague);
router.get("/:vagueId", auth, rapportVagueController.showOne);

module.exports = router;
