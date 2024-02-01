const express = require("express");
const router = express.Router();
const acheteurController = require("../controllers/acheteur");
const auth = require("../middleware/auth");

//les routes pour acheteurs
router.get("/all", auth, acheteurController.showAll);
router.get("/:nom", auth, acheteurController.showOne);
router.post("/check", auth, acheteurController.check);
router.delete("/:id", auth, acheteurController.delete);

module.exports = router;
