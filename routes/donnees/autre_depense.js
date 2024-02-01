const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const autre_depenseController = require("../../controllers/donnees/autre_depense");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, autre_depenseController.showAll);
router.get("/:id", auth, autre_depenseController.showOne);
router.post("/", auth, multer, autre_depenseController.create);
router.put("/:id", auth, multer, autre_depenseController.update);
router.delete("/:id", auth, autre_depenseController.delete);

module.exports = router;
