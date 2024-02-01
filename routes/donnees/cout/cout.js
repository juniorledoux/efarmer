const express = require("express");
const router = express.Router();
const alimmentController = require("../../../controllers/donnees/cout/aliment");
const vagueController = require("../../../controllers/donnees/cout/vague");
const amenagementController = require("../../../controllers/donnees/cout/amenagement");
const autre_depenseController = require("../../../controllers/donnees/cout/autre_depense");
const location_localController = require("../../../controllers/donnees/cout/location_local");
const main_doeuvreController = require("../../../controllers/donnees/cout/main_doeuvre");
const soin_medicalController = require("../../../controllers/donnees/cout/soin_medical");
const eauController = require("../../../controllers/donnees/cout/eau");
const electriciteController = require("../../../controllers/donnees/cout/electricite");
const transport_venteController = require("../../../controllers/donnees/cout/transport_vente");
const auth = require("../../../middleware/auth");

//les routes pour aliment
router.get("/aliment/:vagueId", auth, alimmentController.getPrix);
router.get("/vague/:vagueId", auth, vagueController.getPrix);
router.get("/amenagement/:vagueId", auth, amenagementController.getPrix);
router.get("/autre_depense/:vagueId", auth, autre_depenseController.getPrix);
router.get("/location_local/:vagueId", auth, location_localController.getPrix);
router.get("/main_doeuvre/:vagueId", auth, main_doeuvreController.getPrix);
router.get("/soin_medical/:vagueId", auth, soin_medicalController.getPrix);
router.get("/eau/:vagueId", auth, eauController.getPrix);
router.get("/electricite/:vagueId", auth, electriciteController.getPrix);
router.get("/transport_vente/:vagueId", auth, transport_venteController.getPrix);


module.exports = router;
