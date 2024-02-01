const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const transport_venteController = require("../../controllers/donnees/transport_vente");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, transport_venteController.showAll);
router.get("/:id", auth, transport_venteController.showOne);
router.post("/", auth, multer, transport_venteController.create);
router.put("/:id", auth, multer, transport_venteController.update);
router.delete("/:id", auth, transport_venteController.delete);

module.exports = router;
