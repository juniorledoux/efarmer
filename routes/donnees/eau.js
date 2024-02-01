const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const eauController = require("../../controllers/donnees/eau");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, eauController.showAll);
router.get("/:id", auth, eauController.showOne);
router.post("/", auth, multer, eauController.create);
router.put("/:id", auth, multer, eauController.update);
router.delete("/:id", auth, eauController.delete);

module.exports = router;
