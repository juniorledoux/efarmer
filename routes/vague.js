const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const vague = require('../controllers/vague');
const multer = require("../middleware/multer-config");



router.get('/vague', auth, vague.showAll);
router.post('/vague',auth, multer, vague.create);
router.put('/vague/:id',auth, multer,  vague.update);
router.get('/vague/:id',auth, vague.showOne);
router.delete('/vague/:id',auth, vague.delete);
module.exports = router;

