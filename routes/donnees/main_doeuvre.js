const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const main_doeuvreController = require("../../controllers/donnees/main_doeuvre");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, main_doeuvreController.showAll);
router.get("/:id", auth, main_doeuvreController.showOne);
router.post("/", auth, multer, main_doeuvreController.create);
router.put("/:id", auth, multer, main_doeuvreController.update);
router.delete("/:id", auth, main_doeuvreController.delete);

module.exports = router;
