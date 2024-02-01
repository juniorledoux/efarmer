const express = require("express");
const router = express.Router();
const soinsConsommeController = require("../controllers/donnees/soinsConsomme");
const auth = require("../middleware/auth");

//les routes pour aliment
router.get("/all/:soinsMedicalId", auth, soinsConsommeController.showAll);
router.get("/:id", auth, soinsConsommeController.showOne);
router.post("/", auth, soinsConsommeController.create);
router.put("/:id", auth, soinsConsommeController.update);
router.delete("/:soinsMedicalId/:id", auth, soinsConsommeController.delete);

module.exports = router;
