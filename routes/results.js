const express = require("express");
const router = express.Router();
const resultsController = require("../controllers/results");
const auth = require("../middleware/auth");

//les routes
router.get("/valeur_actu/:id", auth, resultsController.getValeurActu);
router.post("/valeur_sur_date/:id", auth, resultsController.getValeurSurDate);
router.get("/depenses_actu/:id", auth, resultsController.getDepensesActu);
router.get("/reste/:id", auth, resultsController.getReste);
router.post("/valeur_sur_benef/:id", auth, resultsController.getValeurSurBenef);
router.post("/benef_sur_prix/:id", auth, resultsController.getBenefSurPrix);
router.get("/benef_sur_vente/:id", auth, resultsController.getBenefSurVente);

module.exports = router;
