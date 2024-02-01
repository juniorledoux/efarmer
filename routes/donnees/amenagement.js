const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const amenagementController = require("../../controllers/donnees/amenagement");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, amenagementController.showAll);
router.get("/:id", auth, amenagementController.showOne);
router.post("/", auth, multer, amenagementController.create);
router.put("/:id", auth, multer, amenagementController.update);
router.delete("/:id", auth, amenagementController.delete);

module.exports = router;
