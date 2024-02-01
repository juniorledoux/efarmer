const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const location_localController = require("../../controllers/donnees/location_local");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, location_localController.showAll);
router.get("/:id", auth, location_localController.showOne);
router.post("/", auth, multer, location_localController.create);
router.put("/:id", auth, multer, location_localController.update);
router.delete("/:id", auth, location_localController.delete);

module.exports = router;
