const express = require("express");
const router = express.Router();
const perteController = require("../controllers/perte");
const auth = require("../middleware/auth");

//les routes pour pertes
router.get("/all/:vagueId", auth, perteController.showAll);
router.get("/:id", auth, perteController.showOne);
router.post("/", auth, perteController.create);
router.put("/:id", auth, perteController.update);
router.delete("/:id", auth, perteController.delete);

module.exports = router;
