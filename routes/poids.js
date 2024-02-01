const express = require("express");
const router = express.Router();
const poidsController = require("../controllers/poids");
const auth = require("../middleware/auth");

//les routes pour poids
router.get("/all/:vagueId", auth, poidsController.showAll);
router.get("/:id", auth, poidsController.showOne);
router.post("/", auth, poidsController.create);
router.put("/:id", auth, poidsController.update);
router.delete("/:id", auth, poidsController.delete);

module.exports = router;
