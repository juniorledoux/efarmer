const express = require("express");
const router = express.Router();
const alimentUtiliseController = require("../controllers/donnees/alimentUtilise");
const auth = require("../middleware/auth");

//les routes pour aliment
router.get("/all/:alimentId", auth, alimentUtiliseController.showAll);
router.get("/:id", auth, alimentUtiliseController.showOne);
router.post("/", auth, alimentUtiliseController.create);
router.put("/:id", auth, alimentUtiliseController.update);
router.delete("/:alimentId/:id", auth, alimentUtiliseController.delete);

module.exports = router;
