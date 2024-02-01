const express = require("express");
const router = express.Router();
const avancePayementController = require("../controllers/avancePayement");
const auth = require("../middleware/auth");

//les routes pour pertes
router.get("/all/:venteId", auth, avancePayementController.showAll);
router.post("/", auth, avancePayementController.create);
router.delete("/:id", auth, avancePayementController.delete);

module.exports = router;
