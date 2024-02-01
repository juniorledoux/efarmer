const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const electriciteController = require("../../controllers/donnees/electricite");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, electriciteController.showAll);
router.get("/:id", auth, electriciteController.showOne);
router.post("/", auth, multer, electriciteController.create);
router.put("/:id", auth, multer, electriciteController.update);
router.delete("/:id", auth, electriciteController.delete);

module.exports = router;
