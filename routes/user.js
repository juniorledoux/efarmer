const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const auth = require("../middleware/auth");

//les routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.put("/update/:id",auth, userController.update);
router.get("/show/:id",auth, userController.show);
router.put("/update_password/:id", auth, userController.updatePassword);
router.delete("/delete_account/:id/:password", auth, userController.delete);

module.exports = router;
