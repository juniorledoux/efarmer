const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const alimmentController = require("../../controllers/donnees/aliment");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, alimmentController.showAll);
router.get("/:id", auth, alimmentController.showOne);
router.post("/", auth, multer, alimmentController.create);
router.put("/:id", auth, multer, alimmentController.update);
router.delete("/:id", auth, alimmentController.delete);

module.exports = router;
