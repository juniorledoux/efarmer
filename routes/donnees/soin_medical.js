const express = require("express");
const multer = require("../../middleware/multer-config");
const router = express.Router();
const soin_medicalController = require("../../controllers/donnees/soin_medical");
const auth = require("../../middleware/auth");

//les routes pour aliment
router.get("/all/:vagueId", auth, soin_medicalController.showAll);
router.get("/:id", auth, soin_medicalController.showOne);
router.post("/", auth, multer, soin_medicalController.create);
router.put("/:id", auth, multer, soin_medicalController.update);
router.delete("/:id", auth, soin_medicalController.delete);

module.exports = router;
