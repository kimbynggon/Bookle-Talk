const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/check-userid", authController.checkUserId);
router.get("/check-nickname", authController.checkNickname);

module.exports = router;
module.exports = router;
