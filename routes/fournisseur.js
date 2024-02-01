const express = require("express");
const router = express.Router();
const fournisseurController = require("../controllers/fournisseur");
const auth = require("../middleware/auth");

//les routes pour fournisseurs
router.get("/", auth, fournisseurController.showByUserId);
router.get("/all", auth, fournisseurController.showAll);
router.get("/:nom", auth, fournisseurController.showOne);
router.post("/check", auth, fournisseurController.check);
router.put("/:id", auth, fournisseurController.update);
router.delete("/:id", auth, fournisseurController.delete);

module.exports = router;
