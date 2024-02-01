const express = require("express");
const router = express.Router();
const venteController = require("../controllers/vente");
const auth = require("../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, venteController.showAll);
router.get("/:id", auth, venteController.showOne);
router.post("/", auth, venteController.create);
router.put("/:id", auth, venteController.update);
router.delete("/:vagueId/:id", auth, venteController.delete);

module.exports = router;
